
-- Add base_salary to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS base_salary numeric NOT NULL DEFAULT 14000;

-- Create ot_requests table
CREATE TABLE public.ot_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  ot_type text NOT NULL CHECK (ot_type IN ('before_9am', 'after_6pm')),
  ot_minutes integer NOT NULL CHECK (ot_minutes > 0 AND ot_minutes <= 480),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid NULL,
  approved_at timestamp with time zone NULL,
  notes text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ot_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own OT requests
CREATE POLICY "Users can view their own OT requests"
ON public.ot_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own OT requests (must be pending)
CREATE POLICY "Users can insert their own OT requests"
ON public.ot_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own pending OT requests
CREATE POLICY "Users can delete their own pending OT requests"
ON public.ot_requests FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

-- Admins and managers can view all
CREATE POLICY "Admins and managers can view all OT requests"
ON public.ot_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role));

-- Admins can manage all
CREATE POLICY "Admins can manage all OT requests"
ON public.ot_requests FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Managers can update OT requests
CREATE POLICY "Managers can update OT requests"
ON public.ot_requests FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'manager'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_ot_requests_updated_at
BEFORE UPDATE ON public.ot_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
