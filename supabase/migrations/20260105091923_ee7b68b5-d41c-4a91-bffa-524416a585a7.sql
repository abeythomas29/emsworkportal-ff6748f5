-- Fix admin leave requests list: add FK so API can join leave_requests -> profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'leave_requests_user_id_fkey'
  ) THEN
    ALTER TABLE public.leave_requests
    ADD CONSTRAINT leave_requests_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'leave_requests_approved_by_fkey'
  ) THEN
    ALTER TABLE public.leave_requests
    ADD CONSTRAINT leave_requests_approved_by_fkey
    FOREIGN KEY (approved_by)
    REFERENCES public.profiles(id)
    ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON public.leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_approved_by ON public.leave_requests(approved_by);