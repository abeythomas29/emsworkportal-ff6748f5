ALTER TABLE public.ot_requests DROP CONSTRAINT IF EXISTS ot_requests_ot_type_check;
ALTER TABLE public.ot_requests ADD CONSTRAINT ot_requests_ot_type_check
  CHECK (ot_type = ANY (ARRAY['before_9am'::text, 'after_6pm'::text, 'auto_before_9am'::text, 'auto_30min'::text, 'auto_after_6pm'::text]));