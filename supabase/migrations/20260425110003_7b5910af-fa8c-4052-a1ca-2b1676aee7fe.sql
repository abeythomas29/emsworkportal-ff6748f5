
CREATE TABLE public.stock_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('raw_material', 'product')),
  raw_material_id UUID REFERENCES public.raw_materials(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  vendor TEXT,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  purchase_request_id UUID REFERENCES public.purchase_requests(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (item_type = 'raw_material' AND raw_material_id IS NOT NULL AND product_id IS NULL) OR
    (item_type = 'product' AND product_id IS NOT NULL AND raw_material_id IS NULL)
  )
);

ALTER TABLE public.stock_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Production, admins, managers can view stock receipts"
ON public.stock_receipts FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR is_production_user(auth.uid()));

CREATE POLICY "Production users and admins can insert stock receipts"
ON public.stock_receipts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND (is_production_user(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Production users and admins can update stock receipts"
ON public.stock_receipts FOR UPDATE TO authenticated
USING (is_production_user(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (is_production_user(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Production users and admins can delete stock receipts"
ON public.stock_receipts FOR DELETE TO authenticated
USING (is_production_user(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.apply_receipt_to_stock()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.item_type = 'raw_material' THEN
      UPDATE public.raw_materials SET current_stock = current_stock + NEW.quantity WHERE id = NEW.raw_material_id;
    ELSE
      UPDATE public.products SET current_stock = current_stock + NEW.quantity WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.item_type = 'raw_material' THEN
      UPDATE public.raw_materials SET current_stock = current_stock - OLD.quantity WHERE id = OLD.raw_material_id;
    ELSE
      UPDATE public.products SET current_stock = current_stock - OLD.quantity WHERE id = OLD.product_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_apply_receipt_to_stock
AFTER INSERT OR DELETE ON public.stock_receipts
FOR EACH ROW EXECUTE FUNCTION public.apply_receipt_to_stock();

CREATE TRIGGER trg_stock_receipts_updated_at
BEFORE UPDATE ON public.stock_receipts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
