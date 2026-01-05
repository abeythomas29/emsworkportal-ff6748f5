-- Drop existing restrictive policies and recreate as permissive for leave_requests
DROP POLICY IF EXISTS "Admins and managers can view all leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Users can view their own leave requests" ON public.leave_requests;

-- Create permissive policies (default behavior - any matching policy allows access)
CREATE POLICY "Admins and managers can view all leave requests" 
ON public.leave_requests 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Users can view their own leave requests" 
ON public.leave_requests 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Also fix profiles table for the join to work
DROP POLICY IF EXISTS "Admins and managers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Admins and managers can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);