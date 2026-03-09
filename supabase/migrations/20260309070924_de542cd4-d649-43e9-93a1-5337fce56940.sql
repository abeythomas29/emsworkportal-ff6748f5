
CREATE OR REPLACE FUNCTION public.get_upcoming_birthdays()
RETURNS TABLE(id uuid, full_name text, birthday date, avatar_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT p.id, p.full_name, p.birthday, p.avatar_url
  FROM public.profiles p
  WHERE p.birthday IS NOT NULL
    AND p.is_active = true;
$$;
