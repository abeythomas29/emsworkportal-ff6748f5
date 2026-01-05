import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, User> = {
  'admin@ems.com': {
    id: '1',
    email: 'admin@ems.com',
    name: 'Sarah Johnson',
    role: 'admin',
    employeeType: 'online',
    department: 'Human Resources',
    employeeId: 'EMP001',
    joiningDate: '2020-01-15',
  },
  'manager@ems.com': {
    id: '2',
    email: 'manager@ems.com',
    name: 'Michael Chen',
    role: 'manager',
    employeeType: 'online',
    department: 'Engineering',
    employeeId: 'EMP002',
    joiningDate: '2020-03-10',
  },
  'online@ems.com': {
    id: '3',
    email: 'online@ems.com',
    name: 'Emily Davis',
    role: 'employee_online',
    employeeType: 'online',
    department: 'Development',
    employeeId: 'EMP003',
    joiningDate: '2021-06-20',
  },
  'offline@ems.com': {
    id: '4',
    email: 'offline@ems.com',
    name: 'James Wilson',
    role: 'employee_offline',
    employeeType: 'offline',
    department: 'Operations',
    employeeId: 'EMP004',
    joiningDate: '2022-02-01',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = mockUsers[email.toLowerCase()];
    if (user) {
      setAuthState({ user, isAuthenticated: true });
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthState({ user: null, isAuthenticated: false });
  };

  const switchRole = (role: UserRole) => {
    if (authState.user) {
      const employeeType = role === 'employee_offline' ? 'offline' : 'online';
      setAuthState({
        ...authState,
        user: { ...authState.user, role, employeeType },
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
