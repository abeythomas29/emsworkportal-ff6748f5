CREATE POLICY "Users can delete their own pending leave requests"
ON public.leave_requests
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');