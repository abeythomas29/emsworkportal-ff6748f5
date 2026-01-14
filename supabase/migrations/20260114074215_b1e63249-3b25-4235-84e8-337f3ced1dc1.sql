-- Step 1: Add sick_leave balance to casual_leave before removing
UPDATE public.leave_balances 
SET casual_leave = casual_leave + sick_leave;

UPDATE public.default_leave_settings 
SET casual_leave = casual_leave + sick_leave;

-- Step 2: Add consecutive_work_days column for earned leave accrual tracking
ALTER TABLE public.leave_balances 
ADD COLUMN IF NOT EXISTS consecutive_work_days INTEGER NOT NULL DEFAULT 0;

-- Step 3: Add max_earned_leave column to default settings
ALTER TABLE public.default_leave_settings 
ADD COLUMN IF NOT EXISTS max_earned_leave NUMERIC NOT NULL DEFAULT 45;

-- Step 4: Remove sick_leave columns
ALTER TABLE public.leave_balances 
DROP COLUMN IF EXISTS sick_leave;

ALTER TABLE public.default_leave_settings 
DROP COLUMN IF EXISTS sick_leave;

-- Step 5: Create holidays table
CREATE TABLE IF NOT EXISTS public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  day_of_week TEXT NOT NULL,
  holiday_type TEXT NOT NULL CHECK (holiday_type IN ('mandatory', 'optional')),
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, year)
);

-- Enable RLS on holidays
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- Policies for holidays table
CREATE POLICY "Holidays viewable by authenticated users"
ON public.holidays FOR SELECT
USING (true);

CREATE POLICY "Admins can manage holidays"
ON public.holidays FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Step 6: Create employee_holidays table for optional holiday selections
CREATE TABLE IF NOT EXISTS public.employee_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  holiday_id UUID NOT NULL REFERENCES public.holidays(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, holiday_id)
);

-- Enable RLS on employee_holidays
ALTER TABLE public.employee_holidays ENABLE ROW LEVEL SECURITY;

-- Policies for employee_holidays table
CREATE POLICY "Users can view their own holiday selections"
ON public.employee_holidays FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own holiday selections"
ON public.employee_holidays FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own holiday selections"
ON public.employee_holidays FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all holiday selections"
ON public.employee_holidays FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all holiday selections"
ON public.employee_holidays FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Step 7: Pre-populate 2026 holidays
INSERT INTO public.holidays (name, date, day_of_week, holiday_type, year) VALUES
('Makara Sankranthi', '2026-01-15', 'Thursday', 'optional', 2026),
('Republic Day', '2026-01-26', 'Monday', 'mandatory', 2026),
('Holi', '2026-03-02', 'Monday', 'optional', 2026),
('Ugadi', '2026-03-19', 'Thursday', 'optional', 2026),
('May Day', '2026-05-01', 'Friday', 'mandatory', 2026),
('Independence Day', '2026-08-15', 'Saturday', 'mandatory', 2026),
('Varamahalakshmi Vratha', '2026-08-21', 'Friday', 'optional', 2026),
('Ganesha Chathurthi', '2026-09-14', 'Monday', 'optional', 2026),
('Gandhi Jayanthi', '2026-10-02', 'Friday', 'mandatory', 2026),
('Ayoodha Pooja', '2026-10-20', 'Tuesday', 'optional', 2026),
('Vijaya Dashami', '2026-10-21', 'Wednesday', 'optional', 2026),
('Deepavali', '2026-11-10', 'Tuesday', 'optional', 2026)
ON CONFLICT (date, year) DO NOTHING;

-- Step 8: Update handle_leave_approval function to remove sick leave handling
CREATE OR REPLACE FUNCTION public.handle_leave_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only process if status changed to 'approved'
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Update leave balance based on leave type
    IF NEW.leave_type = 'casual' THEN
      UPDATE public.leave_balances
      SET casual_leave = casual_leave - NEW.days,
          consecutive_work_days = 0 -- Reset consecutive days on leave
      WHERE user_id = NEW.user_id;
    ELSIF NEW.leave_type = 'earned' THEN
      UPDATE public.leave_balances
      SET earned_leave = earned_leave - NEW.days,
          consecutive_work_days = 0
      WHERE user_id = NEW.user_id;
    ELSIF NEW.leave_type = 'lwp' THEN
      UPDATE public.leave_balances
      SET lwp_taken = lwp_taken + NEW.days,
          consecutive_work_days = 0
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Step 9: Create function to accrue earned leave (1 day per 20 consecutive work days)
CREATE OR REPLACE FUNCTION public.accrue_earned_leave()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_earned NUMERIC;
  rec RECORD;
BEGIN
  -- Get max earned leave from settings
  SELECT COALESCE(max_earned_leave, 45) INTO max_earned 
  FROM public.default_leave_settings 
  LIMIT 1;

  -- For each leave balance where consecutive_work_days >= 20
  FOR rec IN 
    SELECT id, user_id, earned_leave, consecutive_work_days 
    FROM public.leave_balances 
    WHERE consecutive_work_days >= 20
  LOOP
    -- Add 1 earned leave day (capped at max)
    UPDATE public.leave_balances
    SET earned_leave = LEAST(earned_leave + 1, max_earned),
        consecutive_work_days = consecutive_work_days - 20
    WHERE id = rec.id;
  END LOOP;
END;
$$;

-- Step 10: Create function to cap earned leave at year end
CREATE OR REPLACE FUNCTION public.cap_earned_leave_year_end()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_earned NUMERIC;
BEGIN
  -- Get max earned leave from settings
  SELECT COALESCE(max_earned_leave, 45) INTO max_earned 
  FROM public.default_leave_settings 
  LIMIT 1;

  -- Cap earned leave at max
  UPDATE public.leave_balances
  SET earned_leave = max_earned
  WHERE earned_leave > max_earned;
END;
$$;

-- Step 11: Create function to increment consecutive work days on attendance
CREATE OR REPLACE FUNCTION public.increment_consecutive_work_days()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only increment for 'present' status
  IF NEW.status = 'present' THEN
    UPDATE public.leave_balances
    SET consecutive_work_days = consecutive_work_days + 1
    WHERE user_id = NEW.user_id;
    
    -- Check and accrue earned leave if threshold reached
    PERFORM public.accrue_earned_leave();
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for attendance to increment consecutive work days
DROP TRIGGER IF EXISTS on_attendance_present ON public.attendance;

CREATE TRIGGER on_attendance_present
  AFTER INSERT ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_consecutive_work_days();