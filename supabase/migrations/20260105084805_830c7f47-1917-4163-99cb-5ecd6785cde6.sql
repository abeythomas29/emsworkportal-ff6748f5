-- Add phone_number column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;

-- Create policies table for storing company policies
CREATE TABLE IF NOT EXISTS public.policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  content text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on policies
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Policies are viewable by all authenticated users
CREATE POLICY "Policies are viewable by authenticated users"
ON public.policies
FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage policies
CREATE POLICY "Admins can manage policies"
ON public.policies
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create default_leave_settings table
CREATE TABLE IF NOT EXISTS public.default_leave_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casual_leave numeric NOT NULL DEFAULT 12,
  sick_leave numeric NOT NULL DEFAULT 10,
  earned_leave numeric NOT NULL DEFAULT 15,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.default_leave_settings ENABLE ROW LEVEL SECURITY;

-- Settings viewable by all authenticated
CREATE POLICY "Leave settings viewable by authenticated"
ON public.default_leave_settings
FOR SELECT
TO authenticated
USING (true);

-- Only admins can update
CREATE POLICY "Admins can manage leave settings"
ON public.default_leave_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default leave settings
INSERT INTO public.default_leave_settings (casual_leave, sick_leave, earned_leave)
VALUES (12, 10, 15)
ON CONFLICT DO NOTHING;

-- Trigger for updated_at on policies
CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON public.policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on default_leave_settings  
CREATE TRIGGER update_default_leave_settings_updated_at
  BEFORE UPDATE ON public.default_leave_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();