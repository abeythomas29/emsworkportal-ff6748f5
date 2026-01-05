export type UserRole = 'admin' | 'manager' | 'employee_online' | 'employee_offline';

export type EmployeeType = 'online' | 'offline';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  employeeType: EmployeeType;
  department: string;
  employeeId: string;
  joiningDate: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface LeaveBalance {
  casualLeave: number;
  sickLeave: number;
  earnedLeave: number;
  lwp: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave' | 'lwp' | 'holiday' | 'weekend';

export interface AttendanceRecord {
  id: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
}

export type LeaveType = 'casual' | 'sick' | 'earned' | 'lwp';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
}

export interface WorkLog {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  taskDescription: string;
  status: 'submitted' | 'pending' | 'approved' | 'flagged';
}
