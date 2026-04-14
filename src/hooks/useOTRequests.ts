import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface OTRequest {
  id: string;
  user_id: string;
  date: string;
  ot_type: string;
  ot_minutes: number;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useOTRequests() {
  const { user } = useAuth();
  const [otRequests, setOtRequests] = useState<OTRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [baseSalary, setBaseSalary] = useState(14000);

  const fetchOTRequests = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('ot_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setOtRequests((data || []) as OTRequest[]);
    } catch (error) {
      console.error('Error fetching OT requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchBaseSalary = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('base_salary')
        .eq('id', user.id)
        .single();
      if (data?.base_salary) {
        setBaseSalary(Number(data.base_salary));
      }
    } catch (error) {
      console.error('Error fetching base salary:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchOTRequests();
      fetchBaseSalary();
    }
  }, [user, fetchOTRequests, fetchBaseSalary]);

  const submitOTRequest = async (data: {
    date: string;
    ot_type: string;
    ot_minutes: number;
    notes?: string;
  }) => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from('ot_requests')
        .insert({
          user_id: user.id,
          date: data.date,
          ot_type: data.ot_type,
          ot_minutes: data.ot_minutes,
          notes: data.notes || null,
        });

      if (error) throw error;
      toast.success('OT request submitted!');
      await fetchOTRequests();
      return true;
    } catch (error: any) {
      toast.error('Failed to submit OT request', { description: error.message });
      return false;
    }
  };

  const deleteOTRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ot_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('OT request deleted');
      await fetchOTRequests();
      return true;
    } catch (error: any) {
      toast.error('Failed to delete', { description: error.message });
      return false;
    }
  };

  return {
    otRequests,
    baseSalary,
    isLoading,
    submitOTRequest,
    deleteOTRequest,
    refresh: fetchOTRequests,
  };
}
