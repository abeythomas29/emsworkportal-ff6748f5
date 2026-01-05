import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar';
import { EditLeaveBalanceDialog } from '@/components/employees/EditLeaveBalanceDialog';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  Loader2,
  User,
  CalendarDays,
  Wallet,
  Pencil,
} from 'lucide-react';
import { format } from 'date-fns';

interface EmployeeProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  department: string | null;
  employee_id: string | null;
  employee_type: 'online' | 'offline';
  is_active: boolean;
  joining_date: string | null;
  avatar_url: string | null;
}

interface AttendanceRecord {
  id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  total_hours: number | null;
}

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: string;
  created_at: string;
}

interface LeaveBalance {
  id: string;
  user_id: string;
  casual_leave: number;
  sick_leave: number;
  earned_leave: number;
  lwp_taken: number;
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Only admin and manager can access
  if (role !== 'admin' && role !== 'manager') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as EmployeeProfile);
      }

      // Fetch attendance (last 90 days for calendar view)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', id)
        .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      setAttendance((attendanceData || []) as AttendanceRecord[]);

      // Fetch leave requests
      const { data: leaveData } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(20);

      setLeaveRequests((leaveData || []) as LeaveRequest[]);

      // Fetch leave balance
      const { data: balanceData } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();

      setLeaveBalance(balanceData as LeaveBalance | null);

      setIsLoading(false);
    };

    fetchData();
  }, [id]);

  const refetchLeaveBalance = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('user_id', id)
      .maybeSingle();
    setLeaveBalance(data as LeaveBalance | null);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Employee not found</p>
          <Button variant="link" onClick={() => navigate('/employees')}>
            Back to Employees
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/employees')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </Button>

        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
                {profile.full_name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{profile.full_name}</h1>
                  <StatusBadge status={profile.is_active ? 'approved' : 'rejected'} />
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" /> {profile.email}
                  </span>
                  {profile.phone_number && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" /> {profile.phone_number}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> {profile.department || 'No Department'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-sm">
                  <span className="text-muted-foreground">ID: {profile.employee_id || 'N/A'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    profile.employee_type === 'online' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {profile.employee_type}
                  </span>
                  {profile.joining_date && (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined: {format(new Date(profile.joining_date), 'MMM dd, yyyy')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Attendance and Leave */}
        <Tabs defaultValue="attendance" className="w-full">
          <TabsList>
            <TabsTrigger value="attendance" className="gap-2">
              <Clock className="w-4 h-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="leave" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Leave Requests
            </TabsTrigger>
            <TabsTrigger value="balance" className="gap-2">
              <Wallet className="w-4 h-4" />
              Leave Balance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar View */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attendance Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <AttendanceCalendar attendance={attendance} />
                </CardContent>
              </Card>

              {/* List View */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Records</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[500px] overflow-y-auto">
                  {attendance.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">No attendance records found</p>
                  ) : (
                    <div className="space-y-3">
                      {attendance.slice(0, 30).map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {format(new Date(record.date), 'EEEE, MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {record.check_in
                                ? `Check-in: ${format(new Date(record.check_in), 'hh:mm a')}`
                                : 'No check-in'}
                              {record.check_out &&
                                ` | Check-out: ${format(new Date(record.check_out), 'hh:mm a')}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {record.total_hours && (
                              <span className="text-sm text-muted-foreground">
                                {record.total_hours.toFixed(1)}h
                              </span>
                            )}
                            <StatusBadge
                              status={
                                record.status === 'present'
                                  ? 'approved'
                                  : record.status === 'absent'
                                  ? 'rejected'
                                  : 'pending'
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leave" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {leaveRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">No leave requests found</p>
                ) : (
                  <div className="space-y-3">
                    {leaveRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div>
                          <p className="font-medium text-foreground capitalize">
                            {request.leave_type.replace('_', ' ')} Leave
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(request.start_date), 'MMM dd')} -{' '}
                            {format(new Date(request.end_date), 'MMM dd, yyyy')} ({request.days} days)
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{request.reason}</p>
                        </div>
                        <StatusBadge
                          status={
                            request.status === 'approved'
                              ? 'approved'
                              : request.status === 'rejected'
                              ? 'rejected'
                              : 'pending'
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balance" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Leave Balance</CardTitle>
                {role === 'admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {leaveBalance ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-primary/10 text-center">
                      <p className="text-2xl font-bold text-primary">{leaveBalance.casual_leave}</p>
                      <p className="text-sm text-muted-foreground">Casual Leave</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 text-center">
                      <p className="text-2xl font-bold text-blue-500">{leaveBalance.sick_leave}</p>
                      <p className="text-sm text-muted-foreground">Sick Leave</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-500/10 text-center">
                      <p className="text-2xl font-bold text-green-500">{leaveBalance.earned_leave}</p>
                      <p className="text-sm text-muted-foreground">Earned Leave</p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-500/10 text-center">
                      <p className="text-2xl font-bold text-orange-500">{leaveBalance.lwp_taken}</p>
                      <p className="text-sm text-muted-foreground">LWP Taken</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">No leave balance found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <EditLeaveBalanceDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          leaveBalance={leaveBalance}
          employeeName={profile.full_name}
          onSuccess={refetchLeaveBalance}
        />
      </div>
    </DashboardLayout>
  );
}
