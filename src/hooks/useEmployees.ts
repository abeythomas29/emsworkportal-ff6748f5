import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

export interface Employee {
  id: string;
  email: string;
  full_name: string;
  employee_id: string | null;
  department: string | null;
  employee_type: 'online' | 'offline';
  joining_date: string | null;
  avatar_url: string | null;
  is_active: boolean;
  role?: 'admin' | 'manager' | 'employee';
}

export function useEmployees() {
  const { user, role } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployees = async () => {
    if (!user || (role !== 'admin' && role !== 'manager')) {
      setIsLoading(false);
      return;
    }

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      logError('useEmployees.fetch', error);
      setIsLoading(false);
      return;
    }

    const { data: roles } = await supabase.from('user_roles').select('*');

    const employeesWithRoles = (profiles || []).map((profile) => {
      const userRole = roles?.find((r) => r.user_id === profile.id);
      return { ...profile, role: userRole?.role as 'admin' | 'manager' | 'employee' | undefined };
    });

    setEmployees(employeesWithRoles);
    setIsLoading(false);
  };

  const deactivateEmployee = async (employeeId: string) => {
    const { error } = await supabase.from('profiles').update({ is_active: false }).eq('id', employeeId);
    if (error) {
      logError('useEmployees.deactivate', error);
      toast.error('Failed to deactivate employee');
      return false;
    }
    toast.success('Employee deactivated successfully');
    fetchEmployees();
    return true;
  };

  const activateEmployee = async (employeeId: string) => {
    const { error } = await supabase.from('profiles').update({ is_active: true }).eq('id', employeeId);
    if (error) {
      logError('useEmployees.activate', error);
      toast.error('Failed to activate employee');
      return false;
    }
    toast.success('Employee activated successfully');
    fetchEmployees();
    return true;
  };

  const deleteEmployee = async (employeeId: string) => {
    // Delete in order: leave_requests, leave_balances, attendance, work_hours, user_roles, profiles
    const { error: lrErr } = await supabase.from('leave_requests').delete().eq('user_id', employeeId);
    if (lrErr) { logError('useEmployees.delete.leave_requests', lrErr); toast.error('Failed to delete employee records'); return false; }

    const { error: lbErr } = await supabase.from('leave_balances').delete().eq('user_id', employeeId);
    if (lbErr) { logError('useEmployees.delete.leave_balances', lbErr); toast.error('Failed to delete employee records'); return false; }

    const { error: atErr } = await supabase.from('attendance').delete().eq('user_id', employeeId);
    if (atErr) { logError('useEmployees.delete.attendance', atErr); toast.error('Failed to delete employee records'); return false; }

    const { error: whErr } = await supabase.from('work_hours').delete().eq('user_id', employeeId);
    if (whErr) { logError('useEmployees.delete.work_hours', whErr); toast.error('Failed to delete employee records'); return false; }

    const { error: urErr } = await supabase.from('user_roles').delete().eq('user_id', employeeId);
    if (urErr) { logError('useEmployees.delete.user_roles', urErr); toast.error('Failed to delete employee records'); return false; }

    const { error: prErr } = await supabase.from('profiles').delete().eq('id', employeeId);
    if (prErr) { logError('useEmployees.delete.profiles', prErr); toast.error('Failed to delete employee'); return false; }

    toast.success('Employee and all records deleted successfully');
    fetchEmployees();
    return true;
  };

  useEffect(() => {
    fetchEmployees();
  }, [user, role]);

  return {
    employees, isLoading, refetch: fetchEmployees,
    deactivateEmployee, activateEmployee, deleteEmployee,
  };
}
