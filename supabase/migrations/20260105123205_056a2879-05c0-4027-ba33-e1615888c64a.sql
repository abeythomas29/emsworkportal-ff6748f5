-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "Admins and managers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Recreate policies with explicit authentication checks (auth.uid() IS NOT NULL)
-- This ensures anonymous/unauthenticated users cannot access profile data

-- Policy: Users can view their own profile (requires authentication)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Policy: Users can update their own profile (requires authentication)
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Policy: Admins and managers can view all profiles (requires authentication + role)
CREATE POLICY "Admins and managers can view all profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)));

-- Policy: Admins can manage all profiles (requires authentication + admin role)
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));