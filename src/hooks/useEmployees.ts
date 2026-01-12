import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
      console.error('Error fetching employees:', error);
      setIsLoading(false);
      return;
    }

    // Fetch roles for all users
    const { data: roles } = await supabase.from('user_roles').select('*');

    const employeesWithRoles = (profiles || []).map((profile) => {
      const userRole = roles?.find((r) => r.user_id === profile.id);
      return {
        ...profile,
        role: userRole?.role as 'admin' | 'manager' | 'employee' | undefined,
      };
    });

    setEmployees(employeesWithRoles);
    setIsLoading(false);
  };

  const deactivateEmployee = async (employeeId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', employeeId);

    if (error) {
      console.error('Error deactivating employee:', error);
      toast.error('Failed to deactivate employee');
      return false;
    }

    toast.success('Employee deactivated successfully');
    fetchEmployees();
    return true;
  };

  const activateEmployee = async (employeeId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: true })
      .eq('id', employeeId);

    if (error) {
      console.error('Error activating employee:', error);
      toast.error('Failed to activate employee');
      return false;
    }

    toast.success('Employee activated successfully');
    fetchEmployees();
    return true;
  };

  const deleteEmployee = async (employeeId: string) => {
    // Delete in order: leave_requests, leave_balances, attendance, user_roles, profiles
    const { error: leaveReqError } = await supabase
      .from('leave_requests')
      .delete()
      .eq('user_id', employeeId);

    if (leaveReqError) {
      console.error('Error deleting leave requests:', leaveReqError);
      toast.error('Failed to delete employee records');
      return false;
    }

    const { error: leaveBalError } = await supabase
      .from('leave_balances')
      .delete()
      .eq('user_id', employeeId);

    if (leaveBalError) {
      console.error('Error deleting leave balance:', leaveBalError);
      toast.error('Failed to delete employee records');
      return false;
    }

    const { error: attendanceError } = await supabase
      .from('attendance')
      .delete()
      .eq('user_id', employeeId);

    if (attendanceError) {
      console.error('Error deleting attendance:', attendanceError);
      toast.error('Failed to delete employee records');
      return false;
    }

    const { error: workHoursError } = await supabase
      .from('work_hours')
      .delete()
      .eq('user_id', employeeId);

    if (workHoursError) {
      console.error('Error deleting work hours:', workHoursError);
      toast.error('Failed to delete employee records');
      return false;
    }

    const { error: rolesError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', employeeId);

    if (rolesError) {
      console.error('Error deleting user role:', rolesError);
      toast.error('Failed to delete employee records');
      return false;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', employeeId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      toast.error('Failed to delete employee');
      return false;
    }

    toast.success('Employee and all records deleted successfully');
    fetchEmployees();
    return true;
  };

  useEffect(() => {
    fetchEmployees();
  }, [user, role]);

  return {
    employees,
    isLoading,
    refetch: fetchEmployees,
    deactivateEmployee,
    activateEmployee,
    deleteEmployee,
  };
}
