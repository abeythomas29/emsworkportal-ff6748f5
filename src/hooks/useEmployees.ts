import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

  useEffect(() => {
    fetchEmployees();
  }, [user, role]);

  return {
    employees,
    isLoading,
    refetch: fetchEmployees,
  };
}
