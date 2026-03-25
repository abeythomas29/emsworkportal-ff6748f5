
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND is_active IS NOT DISTINCT FROM (SELECT p.is_active FROM public.profiles p WHERE p.id = id)
  AND employee_type IS NOT DISTINCT FROM (SELECT p.employee_type FROM public.profiles p WHERE p.id = id)
  AND joining_date IS NOT DISTINCT FROM (SELECT p.joining_date FROM public.profiles p WHERE p.id = id)
  AND employee_id IS NOT DISTINCT FROM (SELECT p.employee_id FROM public.profiles p WHERE p.id = id)
);
