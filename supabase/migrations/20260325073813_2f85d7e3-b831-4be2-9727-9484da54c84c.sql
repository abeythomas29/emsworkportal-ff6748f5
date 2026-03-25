
-- Drop the broken policy
DROP POLICY IF EXISTS "Managers can update leave requests" ON public.leave_requests;

-- Create a simple manager update policy (role check only)
CREATE POLICY "Managers can update leave requests" ON public.leave_requests
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role));

-- Use a trigger to prevent changing user_id on updates (covers all roles)
CREATE OR REPLACE FUNCTION public.prevent_leave_request_user_id_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Changing user_id on leave requests is not allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_user_id_change ON public.leave_requests;
CREATE TRIGGER prevent_user_id_change
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_leave_request_user_id_change();
