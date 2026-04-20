
-- Sales tables
CREATE TABLE public.sales_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_no TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  party_name TEXT NOT NULL,
  transaction_type TEXT,
  payment_type TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  received_amount NUMERIC NOT NULL DEFAULT 0,
  balance_due NUMERIC NOT NULL DEFAULT 0,
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  uploaded_by UUID,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_invoices_date ON public.sales_invoices(invoice_date);
CREATE INDEX idx_sales_invoices_party ON public.sales_invoices(party_name);

CREATE TABLE public.sales_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.sales_invoices(id) ON DELETE CASCADE,
  invoice_no TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  party_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  hsn_sac TEXT,
  category TEXT,
  description TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  discount_percent NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  tax_percent NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  stock_deducted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_items_invoice ON public.sales_items(invoice_id);
CREATE INDEX idx_sales_items_date ON public.sales_items(invoice_date);
CREATE INDEX idx_sales_items_product ON public.sales_items(product_id);
CREATE INDEX idx_sales_items_name ON public.sales_items(LOWER(item_name));

-- Upload history (audit)
CREATE TABLE public.sales_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uploaded_by UUID NOT NULL,
  file_name TEXT NOT NULL,
  invoices_inserted INTEGER NOT NULL DEFAULT 0,
  invoices_skipped INTEGER NOT NULL DEFAULT 0,
  items_inserted INTEGER NOT NULL DEFAULT 0,
  items_matched_to_products INTEGER NOT NULL DEFAULT 0,
  stock_deducted_total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage sales invoices" ON public.sales_invoices
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage sales items" ON public.sales_items
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage sales uploads" ON public.sales_uploads
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger: auto-deduct stock when a sales_item is linked to a product
CREATE OR REPLACE FUNCTION public.apply_sale_to_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.product_id IS NOT NULL AND NEW.quantity > 0 AND NEW.stock_deducted = false THEN
      UPDATE public.products
      SET current_stock = current_stock - NEW.quantity
      WHERE id = NEW.product_id;
      NEW.stock_deducted := true;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.product_id IS NOT NULL AND OLD.stock_deducted = true THEN
      UPDATE public.products
      SET current_stock = current_stock + OLD.quantity
      WHERE id = OLD.product_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_sales_items_stock_insert
BEFORE INSERT ON public.sales_items
FOR EACH ROW EXECUTE FUNCTION public.apply_sale_to_stock();

CREATE TRIGGER trg_sales_items_stock_delete
AFTER DELETE ON public.sales_items
FOR EACH ROW EXECUTE FUNCTION public.apply_sale_to_stock();

CREATE TRIGGER trg_sales_invoices_updated_at
BEFORE UPDATE ON public.sales_invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Aggregated stats RPC for dashboard widget
CREATE OR REPLACE FUNCTION public.get_sales_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  month_start DATE := date_trunc('month', CURRENT_DATE)::date;
  month_end DATE := (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::date;
  trend_start DATE := (date_trunc('month', CURRENT_DATE) - interval '5 months')::date;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_build_object(
    'this_month', (
      SELECT jsonb_build_object(
        'revenue', COALESCE(SUM(total_amount), 0),
        'invoices', COUNT(*),
        'outstanding', COALESCE(SUM(balance_due), 0),
        'top_customer', (
          SELECT party_name FROM public.sales_invoices
          WHERE invoice_date BETWEEN month_start AND month_end AND is_cancelled = false
          GROUP BY party_name ORDER BY SUM(total_amount) DESC LIMIT 1
        )
      )
      FROM public.sales_invoices
      WHERE invoice_date BETWEEN month_start AND month_end AND is_cancelled = false
    ),
    'trend', (
      SELECT COALESCE(jsonb_agg(t ORDER BY t->>'month'), '[]'::jsonb) FROM (
        SELECT jsonb_build_object(
          'month', to_char(date_trunc('month', invoice_date), 'YYYY-MM'),
          'label', to_char(date_trunc('month', invoice_date), 'Mon YY'),
          'revenue', SUM(total_amount),
          'invoices', COUNT(*)
        ) AS t
        FROM public.sales_invoices
        WHERE invoice_date >= trend_start AND is_cancelled = false
        GROUP BY date_trunc('month', invoice_date)
      ) sub
    ),
    'top_products', (
      SELECT COALESCE(jsonb_agg(p), '[]'::jsonb) FROM (
        SELECT item_name AS name,
               SUM(quantity) AS quantity,
               SUM(amount) AS revenue
        FROM public.sales_items
        WHERE invoice_date BETWEEN month_start AND month_end
        GROUP BY item_name
        ORDER BY SUM(amount) DESC
        LIMIT 5
      ) p
    )
  ) INTO result;

  RETURN result;
END;
$$;
