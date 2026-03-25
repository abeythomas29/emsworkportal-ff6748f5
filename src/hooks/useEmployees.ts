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
    const tables = [
      { name: 'leave_requests', col: 'user_id' },
      { name: 'leave_balances', col: 'user_id' },
      { name: 'attendance', col: 'user_id' },
      { name: 'work_hours', col: 'user_id' },
      { name: 'user_roles', col: 'user_id' },
      { name: 'profiles', col: 'id' },
    ] as const;

    for (const table of tables) {
      const { error } = await supabase.from(table.name).delete().eq(table.col, employeeId);
      if (error) {
        logError(`useEmployees.delete.${table.name}`, error);
        toast.error('Failed to delete employee records');
        return false;
      }
    }

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
