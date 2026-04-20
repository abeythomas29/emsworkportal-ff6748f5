
CREATE OR REPLACE FUNCTION public.get_sales_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  latest_month DATE;
  month_start DATE;
  month_end DATE;
  trend_start DATE;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Find the most recent month that has any (non-cancelled) sales
  SELECT date_trunc('month', MAX(invoice_date))::date
    INTO latest_month
  FROM public.sales_invoices
  WHERE is_cancelled = false;

  -- Fallback to current month if there's no data at all
  IF latest_month IS NULL THEN
    latest_month := date_trunc('month', CURRENT_DATE)::date;
  END IF;

  month_start := latest_month;
  month_end := (latest_month + interval '1 month - 1 day')::date;
  trend_start := (latest_month - interval '5 months')::date;

  SELECT jsonb_build_object(
    'latest_month', to_char(latest_month, 'YYYY-MM'),
    'latest_month_label', to_char(latest_month, 'Mon YYYY'),
    'this_month', (
      SELECT jsonb_build_object(
        'revenue', COALESCE(SUM(total_amount), 0),
        'invoices', COUNT(*),
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
        WHERE invoice_date >= trend_start
          AND invoice_date <= month_end
          AND is_cancelled = false
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
