
-- Helper function: check if user is in production department
CREATE OR REPLACE FUNCTION public.is_production_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id
      AND LOWER(COALESCE(department, '')) = 'production'
      AND COALESCE(is_active, true) = true
  );
$$;

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL DEFAULT 'kg',
  current_stock NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Production, admins, managers can view products"
  ON public.products FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
    OR public.is_production_user(auth.uid())
  );

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ RAW MATERIALS ============
CREATE TABLE public.raw_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL DEFAULT 'kg' CHECK (unit IN ('kg','lt')),
  current_stock NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Production, admins, managers can view raw materials"
  ON public.raw_materials FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
    OR public.is_production_user(auth.uid())
  );

CREATE POLICY "Admins can manage raw materials"
  ON public.raw_materials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER raw_materials_updated_at
  BEFORE UPDATE ON public.raw_materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PRODUCTION LOGS ============
CREATE TABLE public.production_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity_produced NUMERIC NOT NULL CHECK (quantity_produced > 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_production_logs_date ON public.production_logs(date DESC);
CREATE INDEX idx_production_logs_user ON public.production_logs(user_id);

ALTER TABLE public.production_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Production, admins, managers can view all production logs"
  ON public.production_logs FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
    OR public.is_production_user(auth.uid())
  );

CREATE POLICY "Production users can insert their own production logs"
  ON public.production_logs FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (public.is_production_user(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Production users can update their own production logs"
  ON public.production_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND public.is_production_user(auth.uid()))
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all production logs"
  ON public.production_logs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER production_logs_updated_at
  BEFORE UPDATE ON public.production_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PRODUCTION LOG MATERIALS ============
CREATE TABLE public.production_log_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_log_id UUID NOT NULL REFERENCES public.production_logs(id) ON DELETE CASCADE,
  raw_material_id UUID NOT NULL REFERENCES public.raw_materials(id) ON DELETE RESTRICT,
  quantity_consumed NUMERIC NOT NULL CHECK (quantity_consumed > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plm_log ON public.production_log_materials(production_log_id);

ALTER TABLE public.production_log_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View materials if can view parent log"
  ON public.production_log_materials FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
    OR public.is_production_user(auth.uid())
  );

CREATE POLICY "Insert materials for own production logs"
  ON public.production_log_materials FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.production_logs pl
      WHERE pl.id = production_log_id
        AND (
          (pl.user_id = auth.uid() AND public.is_production_user(auth.uid()))
          OR public.has_role(auth.uid(), 'admin')
        )
    )
  );

CREATE POLICY "Delete materials for own production logs"
  ON public.production_log_materials FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.production_logs pl
      WHERE pl.id = production_log_id
        AND (
          (pl.user_id = auth.uid() AND public.is_production_user(auth.uid()))
          OR public.has_role(auth.uid(), 'admin')
        )
    )
  );

CREATE POLICY "Admins can manage all log materials"
  ON public.production_log_materials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ AUTO-INVENTORY TRIGGERS ============
-- Increase product stock on production log insert
CREATE OR REPLACE FUNCTION public.apply_production_to_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.products
    SET current_stock = current_stock + NEW.quantity_produced
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.products
    SET current_stock = current_stock - OLD.quantity_produced
    WHERE id = OLD.product_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Adjust delta
    UPDATE public.products
    SET current_stock = current_stock - OLD.quantity_produced
    WHERE id = OLD.product_id;
    UPDATE public.products
    SET current_stock = current_stock + NEW.quantity_produced
    WHERE id = NEW.product_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_apply_production_to_stock
  AFTER INSERT OR UPDATE OR DELETE ON public.production_logs
  FOR EACH ROW EXECUTE FUNCTION public.apply_production_to_stock();

-- Decrease raw material stock on consumption insert
CREATE OR REPLACE FUNCTION public.apply_consumption_to_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.raw_materials
    SET current_stock = current_stock - NEW.quantity_consumed
    WHERE id = NEW.raw_material_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.raw_materials
    SET current_stock = current_stock + OLD.quantity_consumed
    WHERE id = OLD.raw_material_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_apply_consumption_to_stock
  AFTER INSERT OR DELETE ON public.production_log_materials
  FOR EACH ROW EXECUTE FUNCTION public.apply_consumption_to_stock();
