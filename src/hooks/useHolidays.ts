import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

export interface Holiday {
  id: string;
  name: string;
  date: string;
  day_of_week: string;
  holiday_type: 'mandatory' | 'optional';
  year: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeHoliday {
  id: string;
  user_id: string;
  holiday_id: string;
  year: number;
  created_at: string;
}

export function useHolidays() {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedHolidays, setSelectedHolidays] = useState<EmployeeHoliday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentYear = new Date().getFullYear();

  const fetchHolidays = async () => {
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .eq('year', currentYear)
      .order('date', { ascending: true });

    if (error) {
      logError('useHolidays.fetch', error);
      return;
    }
    setHolidays((data || []) as Holiday[]);
  };

  const fetchSelectedHolidays = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('employee_holidays')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', currentYear);

    if (error) {
      logError('useHolidays.fetchSelected', error);
      return;
    }
    setSelectedHolidays((data || []) as EmployeeHoliday[]);
  };

  const selectHoliday = async (holidayId: string) => {
    if (!user) return { error: 'Not authenticated' };

    const optionalHolidays = holidays.filter(h => h.holiday_type === 'optional');
    const selectedOptionalCount = selectedHolidays.filter(
      sh => optionalHolidays.some(oh => oh.id === sh.holiday_id)
    ).length;

    if (selectedOptionalCount >= 6) {
      toast.error('You can only select up to 6 optional holidays');
      return { error: 'Maximum optional holidays reached' };
    }

    const { error } = await supabase.from('employee_holidays').insert({
      user_id: user.id,
      holiday_id: holidayId,
      year: currentYear,
    });

    if (error) {
      logError('useHolidays.select', error);
      toast.error('Failed to select holiday');
      return { error: 'Failed to select holiday. Please try again.' };
    }

    toast.success('Holiday selected');
    fetchSelectedHolidays();
    return { error: null };
  };

  const deselectHoliday = async (holidayId: string) => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('employee_holidays')
      .delete()
      .eq('user_id', user.id)
      .eq('holiday_id', holidayId);

    if (error) {
      logError('useHolidays.deselect', error);
      toast.error('Failed to deselect holiday');
      return { error: 'Failed to deselect holiday. Please try again.' };
    }

    toast.success('Holiday deselected');
    fetchSelectedHolidays();
    return { error: null };
  };

  const isHolidaySelected = (holidayId: string) => selectedHolidays.some(sh => sh.holiday_id === holidayId);
  const getMandatoryHolidays = () => holidays.filter(h => h.holiday_type === 'mandatory');
  const getOptionalHolidays = () => holidays.filter(h => h.holiday_type === 'optional');
  const getSelectedOptionalCount = () => {
    const optionalHolidays = holidays.filter(h => h.holiday_type === 'optional');
    return selectedHolidays.filter(sh => optionalHolidays.some(oh => oh.id === sh.holiday_id)).length;
  };

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([fetchHolidays(), fetchSelectedHolidays()]).finally(() => setIsLoading(false));
    }
  }, [user]);

  return {
    holidays, selectedHolidays, isLoading,
    selectHoliday, deselectHoliday, isHolidaySelected,
    getMandatoryHolidays, getOptionalHolidays, getSelectedOptionalCount,
    refetch: () => { fetchHolidays(); fetchSelectedHolidays(); },
  };
}
