import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AttendanceRecord, AttendanceStatus } from '@/types/auth';
import { toast } from 'sonner';
import { logError, logDebug } from '@/lib/logger';

export function useAttendance() {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const fetchTodayAttendance = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) {
        logError('useAttendance.fetchToday', error);
        return;
      }
      setTodayAttendance(data as AttendanceRecord | null);
    } catch (error) {
      logError('useAttendance.fetchToday', error);
    }
  }, [user, today]);

  const fetchAttendanceHistory = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        logError('useAttendance.fetchHistory', error);
        return;
      }
      setAttendanceHistory((data || []) as AttendanceRecord[]);
    } catch (error) {
      logError('useAttendance.fetchHistory', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTodayAttendance();
      fetchAttendanceHistory();
    }
  }, [user, fetchTodayAttendance, fetchAttendanceHistory]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance', filter: `user_id=eq.${user.id}` },
        () => {
          fetchTodayAttendance();
          fetchAttendanceHistory();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchTodayAttendance, fetchAttendanceHistory]);

  const checkIn = async () => {
    if (!user) { toast.error('Please log in to check in'); return false; }
    if (todayAttendance?.check_in) { toast.info('You have already checked in today'); return false; }

    setIsCheckingIn(true);
    try {
      const now = new Date().toISOString();
      if (todayAttendance) {
        const { error } = await supabase
          .from('attendance')
          .update({ check_in: now, status: 'present' as AttendanceStatus })
          .eq('id', todayAttendance.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('attendance')
          .insert({ user_id: user.id, date: today, check_in: now, status: 'present' as AttendanceStatus });
        if (error) throw error;
      }

      toast.success('Checked in successfully!', { description: `Time: ${new Date().toLocaleTimeString()}` });
      await fetchTodayAttendance();
      return true;
    } catch (error) {
      logError('useAttendance.checkIn', error);
      toast.error('Failed to check in', { description: 'Please try again or contact support.' });
      return false;
    } finally {
      setIsCheckingIn(false);
    }
  };

  const checkOut = async () => {
    if (!user) { toast.error('Please log in to check out'); return false; }
    if (!todayAttendance?.check_in) { toast.error('You need to check in first'); return false; }
    if (todayAttendance?.check_out) { toast.info('You have already checked out today'); return false; }

    setIsCheckingOut(true);
    try {
      const now = new Date();
      const checkInTime = new Date(todayAttendance.check_in);
      if (now <= checkInTime) {
        toast.error('Check-out time must be after check-in time');
        setIsCheckingOut(false);
        return false;
      }

      const { error } = await supabase
        .from('attendance')
        .update({ check_out: now.toISOString() })
        .eq('id', todayAttendance.id);
      if (error) throw error;

      // Auto-create OT request for production workers who check out after 5:30 PM
      if (user.department?.toLowerCase() === 'production') {
        const totalMinutes = now.getHours() * 60 + now.getMinutes();
        const threshold = 17 * 60 + 30; // 5:30 PM
        if (totalMinutes > threshold) {
          const otMinutes = Math.min(totalMinutes - threshold, 30); // Cap at 30 mins for auto OT
          // Check if auto OT already exists for today
          const { data: existingOT } = await supabase
            .from('ot_requests')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', today)
            .eq('ot_type', 'auto_after_530pm');
          
          if (!existingOT || existingOT.length === 0) {
            await supabase
              .from('ot_requests')
              .insert({
                user_id: user.id,
                date: today,
                ot_type: 'auto_after_530pm',
                ot_minutes: otMinutes,
                notes: `Auto-generated: checked out at ${now.toLocaleTimeString()}`,
              });
          }
        }
      }

      toast.success('Checked out successfully!', { description: `Time: ${new Date().toLocaleTimeString()}` });
      await fetchTodayAttendance();
      return true;
    } catch (error) {
      logError('useAttendance.checkOut', error);
      toast.error('Failed to check out', { description: 'Please try again or contact support.' });
      return false;
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getWorkingTime = (): string => {
    if (!todayAttendance?.check_in) return '0h 0m';
    const checkInTime = new Date(todayAttendance.check_in);
    const endTime = todayAttendance.check_out ? new Date(todayAttendance.check_out) : new Date();
    const diffMs = endTime.getTime() - checkInTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return {
    todayAttendance, attendanceHistory, isLoading, isCheckingIn, isCheckingOut,
    checkIn, checkOut, getWorkingTime,
    refresh: () => { fetchTodayAttendance(); fetchAttendanceHistory(); },
  };
}
