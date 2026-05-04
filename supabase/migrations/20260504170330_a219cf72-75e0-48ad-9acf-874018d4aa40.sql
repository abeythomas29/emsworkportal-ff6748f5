CREATE OR REPLACE FUNCTION public.get_basic_profiles(_user_ids uuid[])
RETURNS TABLE(id uuid, full_name text, department text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.full_name, p.department
  FROM public.profiles p
  WHERE p.id = ANY(_user_ids);
$$;