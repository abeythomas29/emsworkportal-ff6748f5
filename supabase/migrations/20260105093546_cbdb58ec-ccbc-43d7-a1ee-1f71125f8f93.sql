-- Fix relationship so admin can embed employee profiles for leave requests
ALTER TABLE public.leave_requests
  DROP CONSTRAINT IF EXISTS leave_requests_user_id_fkey,
  DROP CONSTRAINT IF EXISTS leave_requests_approved_by_fkey;

ALTER TABLE public.leave_requests
  ADD CONSTRAINT leave_requests_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.leave_requests
  ADD CONSTRAINT leave_requests_approved_by_fkey
    FOREIGN KEY (approved_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON public.leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_approved_by ON public.leave_requests(approved_by);
