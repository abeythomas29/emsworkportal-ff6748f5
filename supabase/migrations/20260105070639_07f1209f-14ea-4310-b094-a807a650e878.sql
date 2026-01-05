-- Create leave_requests table
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('casual', 'sick', 'earned', 'lwp')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_half_day BOOLEAN NOT NULL DEFAULT false,
  days NUMERIC NOT NULL DEFAULT 1,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Create leave_balances table
CREATE TABLE public.leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  casual_leave NUMERIC NOT NULL DEFAULT 12,
  sick_leave NUMERIC NOT NULL DEFAULT 10,
  earned_leave NUMERIC NOT NULL DEFAULT 15,
  lwp_taken NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

-- RLS for leave_requests
CREATE POLICY "Users can view their own leave requests"
ON public.leave_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leave requests"
ON public.leave_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and managers can view all leave requests"
ON public.leave_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can manage all leave requests"
ON public.leave_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can update leave requests"
ON public.leave_requests
FOR UPDATE
USING (has_role(auth.uid(), 'manager'));

-- RLS for leave_balances
CREATE POLICY "Users can view their own leave balance"
ON public.leave_balances
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins and managers can view all leave balances"
ON public.leave_balances
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can manage all leave balances"
ON public.leave_balances
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Function to create leave balance for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_leave_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.leave_balances (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger to create leave balance on user signup
CREATE TRIGGER on_auth_user_created_leave_balance
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_leave_balance();

-- Triggers for updated_at
CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at
  BEFORE UPDATE ON public.leave_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for leave_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;