
-- Fix manager UPDATE policy: add WITH CHECK to prevent changing user_id
DROP POLICY IF EXISTS "Managers can update leave requests" ON public.leave_requests;

CREATE POLICY "Managers can update leave requests" ON public.leave_requests
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (
  has_role(auth.uid(), 'manager'::app_role)
  AND user_id = (SELECT user_id FROM public.leave_requests WHERE id = leave_requests.id)
);
