-- Ensure the trigger exists for automatically deducting leave balances on approval
DROP TRIGGER IF EXISTS on_leave_approved ON public.leave_requests;

CREATE TRIGGER on_leave_approved
  AFTER UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_leave_approval();