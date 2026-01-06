-- Create a function to update leave balance when leave is approved
CREATE OR REPLACE FUNCTION public.handle_leave_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only process when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Update the appropriate leave balance based on leave type
    IF NEW.leave_type = 'casual' THEN
      UPDATE public.leave_balances
      SET casual_leave = casual_leave - NEW.days,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSIF NEW.leave_type = 'sick' THEN
      UPDATE public.leave_balances
      SET sick_leave = sick_leave - NEW.days,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSIF NEW.leave_type = 'earned' THEN
      UPDATE public.leave_balances
      SET earned_leave = earned_leave - NEW.days,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSIF NEW.leave_type = 'lwp' THEN
      UPDATE public.leave_balances
      SET lwp_taken = lwp_taken + NEW.days,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update leave balance on approval
DROP TRIGGER IF EXISTS on_leave_approved ON public.leave_requests;
CREATE TRIGGER on_leave_approved
  AFTER UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_leave_approval();