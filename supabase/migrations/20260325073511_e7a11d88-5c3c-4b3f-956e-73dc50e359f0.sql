
-- Create a single-arg SECURITY DEFINER function that bypasses RLS for role checks
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = _role
  );
$$;

-- Restrict execution to authenticated users only
REVOKE EXECUTE ON FUNCTION public.has_role(app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(app_role) TO authenticated;

-- Drop all existing policies on user_roles
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Recreate policies using the single-arg SECURITY DEFINER function
CREATE POLICY "Users can view their own role" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT TO authenticated USING (public.has_role('admin'::app_role));

CREATE POLICY "Admins can insert roles" ON public.user_roles
FOR INSERT TO authenticated WITH CHECK (public.has_role('admin'::app_role));

CREATE POLICY "Admins can update roles" ON public.user_roles
FOR UPDATE TO authenticated USING (public.has_role('admin'::app_role));

CREATE POLICY "Admins can delete roles" ON public.user_roles
FOR DELETE TO authenticated USING (public.has_role('admin'::app_role));
