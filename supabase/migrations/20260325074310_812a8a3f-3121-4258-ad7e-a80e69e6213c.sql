
DROP POLICY IF EXISTS "Managers can update leave requests" ON public.leave_requests;

CREATE POLICY "Managers can update leave requests" ON public.leave_requests
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (
  has_role(auth.uid(), 'manager'::app_role)
  AND status IN ('pending', 'approved', 'rejected')
  AND approved_by = auth.uid()
);
