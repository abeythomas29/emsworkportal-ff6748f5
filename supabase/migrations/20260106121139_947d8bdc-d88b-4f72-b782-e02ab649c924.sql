-- Create function to mark employees absent if they didn't check in for a given date
CREATE OR REPLACE FUNCTION public.mark_absent_for_missing_checkins(target_date date DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer := 0;
BEGIN
  -- Insert absent records for all active employees who don't have attendance for the target date
  -- Exclude weekends (Saturday = 6, Sunday = 0)
  IF EXTRACT(DOW FROM target_date) NOT IN (0, 6) THEN
    INSERT INTO public.attendance (user_id, date, status, notes)
    SELECT 
      p.id,
      target_date,
      'absent'::attendance_status,
      'Auto-marked absent - no check-in recorded'
    FROM public.profiles p
    WHERE p.is_active = true
      AND NOT EXISTS (
        SELECT 1 FROM public.attendance a 
        WHERE a.user_id = p.id AND a.date = target_date
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.leave_requests lr
        WHERE lr.user_id = p.id 
          AND lr.status = 'approved'
          AND target_date BETWEEN lr.start_date AND lr.end_date
      );
    
    GET DIAGNOSTICS inserted_count = ROW_COUNT;
  END IF;
  
  RETURN inserted_count;
END;
$$;

-- Grant execute permission to authenticated users (admins will use this)
GRANT EXECUTE ON FUNCTION public.mark_absent_for_missing_checkins(date) TO authenticated;