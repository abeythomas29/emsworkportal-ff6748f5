import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Clock,
  Calendar,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ClockIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data
const todayStats = {
  present: 142,
  absent: 8,
  onLeave: 12,
  late: 5,
};

const leaveRequests = [
  { id: 1, name: 'John Smith', type: 'Casual', days: 2, status: 'pending' as const },
  { id: 2, name: 'Emma Wilson', type: 'Sick', days: 1, status: 'pending' as const },
  { id: 3, name: 'Michael Brown', type: 'Earned', days: 5, status: 'pending' as const },
];

const recentActivity = [
  { id: 1, action: 'Check-in', user: 'Alice Johnson', time: '09:02 AM', icon: <CheckCircle2 className="w-4 h-4 text-success" /> },
  { id: 2, action: 'Leave Applied', user: 'Bob Williams', time: '08:45 AM', icon: <Calendar className="w-4 h-4 text-info" /> },
  { id: 3, action: 'Late Arrival', user: 'Charlie Davis', time: '09:35 AM', icon: <AlertTriangle className="w-4 h-4 text-warning" /> },
  { id: 4, action: 'Check-out', user: 'Diana Miller', time: '06:00 PM', icon: <XCircle className="w-4 h-4 text-muted-foreground" /> },
];

const departmentStats = [
  { name: 'Engineering', present: 45, total: 50, percentage: 90 },
  { name: 'Marketing', present: 28, total: 30, percentage: 93 },
  { name: 'Sales', present: 35, total: 40, percentage: 88 },
  { name: 'HR', present: 12, total: 12, percentage: 100 },
  { name: 'Operations', present: 22, total: 30, percentage: 73 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Good morning, {user?.name.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={user?.employeeType === 'online' ? 'present' : 'approved'} />
            <span className="text-sm text-muted-foreground">
              {user?.employeeType === 'online' ? 'Online Employee' : 'Offline Employee'}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Present Today"
              value={todayStats.present}
              subtitle="Out of 162 employees"
              icon={<Users className="w-6 h-6 text-primary" />}
              variant="primary"
            />
            <StatCard
              title="On Leave"
              value={todayStats.onLeave}
              subtitle="Approved leaves"
              icon={<Calendar className="w-6 h-6 text-info" />}
              variant="default"
            />
            <StatCard
              title="Absent"
              value={todayStats.absent}
              subtitle="Unexcused absences"
              icon={<XCircle className="w-6 h-6 text-destructive" />}
              variant="destructive"
            />
            <StatCard
              title="Late Arrivals"
              value={todayStats.late}
              subtitle="After 9:30 AM"
              icon={<ClockIcon className="w-6 h-6 text-warning" />}
              variant="warning"
            />
          </div>
        )}

        {/* Employee View Stats */}
        {!isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Days Worked"
              value="22"
              subtitle="This month"
              icon={<CheckCircle2 className="w-6 h-6 text-success" />}
              variant="primary"
            />
            <StatCard
              title="Leave Balance"
              value="12"
              subtitle="Days remaining"
              icon={<Calendar className="w-6 h-6 text-info" />}
              variant="secondary"
            />
            {user?.employeeType === 'online' && (
              <StatCard
                title="Hours Logged"
                value="176"
                subtitle="This month"
                icon={<Clock className="w-6 h-6 text-primary" />}
                variant="default"
              />
            )}
            <StatCard
              title="Attendance Rate"
              value="98%"
              subtitle="This month"
              icon={<TrendingUp className="w-6 h-6 text-success" />}
              trend={{ value: 2.5, isPositive: true }}
              variant="success"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Leave Requests - Admin/Manager */}
          {isAdmin && (
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Pending Leave Requests</CardTitle>
                <Link to="/leave-requests">
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaveRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {request.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{request.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.type} Leave • {request.days} day{request.days > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={request.status} />
                        <Button size="sm" variant="outline" className="text-success border-success hover:bg-success hover:text-success-foreground">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Employee Quick Actions */}
          {!isAdmin && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user?.employeeType === 'online' && (
                    <Link to="/work-hours">
                      <div className="p-6 rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer">
                        <Clock className="w-8 h-8 mb-3" />
                        <h3 className="font-semibold text-lg">Log Work Hours</h3>
                        <p className="text-sm opacity-80">Record today's work</p>
                      </div>
                    </Link>
                  )}
                  <Link to="/leave">
                    <div className="p-6 rounded-xl bg-gradient-secondary text-secondary-foreground hover:opacity-90 transition-opacity cursor-pointer">
                      <Calendar className="w-8 h-8 mb-3" />
                      <h3 className="font-semibold text-lg">Apply for Leave</h3>
                      <p className="text-sm opacity-80">Request time off</p>
                    </div>
                  </Link>
                  <Link to="/attendance">
                    <div className="p-6 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                      <CheckCircle2 className="w-8 h-8 mb-3 text-primary" />
                      <h3 className="font-semibold text-lg">View Attendance</h3>
                      <p className="text-sm text-muted-foreground">Check your records</p>
                    </div>
                  </Link>
                  <Link to="/settings">
                    <div className="p-6 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                      <Users className="w-8 h-8 mb-3 text-accent" />
                      <h3 className="font-semibold text-lg">My Profile</h3>
                      <p className="text-sm text-muted-foreground">Update information</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Overview - Admin Only */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Department Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentStats.map((dept) => (
                  <div key={dept.name} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-foreground">{dept.name}</div>
                    <div className="flex-1">
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${dept.percentage}%`,
                            background: dept.percentage >= 90
                              ? 'hsl(var(--success))'
                              : dept.percentage >= 75
                              ? 'hsl(var(--warning))'
                              : 'hsl(var(--destructive))',
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-sm text-muted-foreground text-right">
                      {dept.present}/{dept.total} ({dept.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
