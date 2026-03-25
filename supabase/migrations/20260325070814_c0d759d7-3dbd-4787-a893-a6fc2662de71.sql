
-- Drop existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins and managers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Recreate with 'authenticated' role
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins and managers can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
