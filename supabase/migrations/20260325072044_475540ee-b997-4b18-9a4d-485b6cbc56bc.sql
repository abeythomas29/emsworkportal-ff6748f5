
-- Fix employee_holidays: change all policies from public to authenticated
DROP POLICY IF EXISTS "Users can view their own holiday selections" ON public.employee_holidays;
DROP POLICY IF EXISTS "Users can insert their own holiday selections" ON public.employee_holidays;
DROP POLICY IF EXISTS "Users can delete their own holiday selections" ON public.employee_holidays;
DROP POLICY IF EXISTS "Admins can view all holiday selections" ON public.employee_holidays;
DROP POLICY IF EXISTS "Admins can manage all holiday selections" ON public.employee_holidays;

CREATE POLICY "Users can view their own holiday selections" ON public.employee_holidays FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own holiday selections" ON public.employee_holidays FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own holiday selections" ON public.employee_holidays FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all holiday selections" ON public.employee_holidays FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage all holiday selections" ON public.employee_holidays FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix leave_requests: change remaining public policies to authenticated
DROP POLICY IF EXISTS "Users can insert their own leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Admins can manage all leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Managers can update leave requests" ON public.leave_requests;

CREATE POLICY "Users can insert their own leave requests" ON public.leave_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all leave requests" ON public.leave_requests FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Managers can update leave requests" ON public.leave_requests FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'manager'::app_role));

-- Fix leave_balances: change all policies from public to authenticated
DROP POLICY IF EXISTS "Users can view their own leave balance" ON public.leave_balances;
DROP POLICY IF EXISTS "Admins and managers can view all leave balances" ON public.leave_balances;
DROP POLICY IF EXISTS "Admins can manage all leave balances" ON public.leave_balances;

CREATE POLICY "Users can view their own leave balance" ON public.leave_balances FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins and managers can view all leave balances" ON public.leave_balances FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Admins can manage all leave balances" ON public.leave_balances FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix holidays: change all policies from public to authenticated
DROP POLICY IF EXISTS "Holidays viewable by authenticated users" ON public.holidays;
DROP POLICY IF EXISTS "Admins can manage holidays" ON public.holidays;

CREATE POLICY "Holidays viewable by authenticated users" ON public.holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage holidays" ON public.holidays FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
