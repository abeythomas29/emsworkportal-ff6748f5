import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  total_hours: number | null;
  notes: string | null;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  employee_id: string | null;
}

interface AttendanceWithProfile extends AttendanceRecord {
  profile?: Profile;
}

export function useAllAttendance() {
  const { role } = useAuth();
  const [allAttendance, setAllAttendance] = useState<AttendanceWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllAttendance = useCallback(async (startDate?: string, endDate?: string) => {
    if (role !== 'admin' && role !== 'manager') return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false });

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data: attendanceData, error: attendanceError } = await query;

      if (attendanceError) {
        logError('useAllAttendance.fetch', attendanceError);
        toast.error('Failed to fetch attendance data');
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, department, employee_id');

      if (profilesError) {
        logError('useAllAttendance.fetchProfiles', profilesError);
      }

      const profilesMap = new Map<string, Profile>();
      (profilesData || []).forEach(p => profilesMap.set(p.id, p as Profile));

      const combined: AttendanceWithProfile[] = (attendanceData || []).map(a => ({
        ...a,
        profile: profilesMap.get(a.user_id),
      }));

      setAllAttendance(combined);
    } catch (error) {
      logError('useAllAttendance.fetch', error);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  const markAbsentForDate = useCallback(async (date: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('mark-absent', {
        body: { date }
      });

      if (error) throw error;

      toast.success(data.message || 'Absent marking completed');
      return data.count;
    } catch (error) {
      logError('useAllAttendance.markAbsent', error);
      toast.error('Failed to mark absent');
      return 0;
    }
  }, []);

  return { allAttendance, isLoading, fetchAllAttendance, markAbsentForDate };
}
