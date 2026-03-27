
DROP POLICY "Users can insert their own leave requests" ON public.leave_requests;

CREATE POLICY "Users can insert their own leave requests" ON public.leave_requests
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');
