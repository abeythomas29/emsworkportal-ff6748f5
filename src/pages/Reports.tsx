import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Download,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEmployees } from '@/hooks/useEmployees';
import { useLeave } from '@/hooks/useLeave';

export default function ReportsPage() {
  const { role } = useAuth();
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { allLeaveRequests, isLoading: leaveLoading } = useLeave();

  // Only admin and manager can access this
  if (role !== 'admin' && role !== 'manager') {
    return <Navigate to="/dashboard" replace />;
  }

  const reportTypes = [
    { icon: <Calendar className="w-8 h-8" />, title: 'Attendance Report', desc: 'Daily/Monthly attendance summary', color: 'bg-primary/10 text-primary', link: '/attendance-report' },
    { icon: <Clock className="w-8 h-8" />, title: 'Work Hours Report', desc: 'Employee work hours breakdown', color: 'bg-secondary/10 text-secondary', link: null },
    { icon: <Users className="w-8 h-8" />, title: 'Leave Report', desc: 'Leave utilization & balances', color: 'bg-info/10 text-info', link: null },
    { icon: <TrendingUp className="w-8 h-8" />, title: 'Performance Report', desc: 'Department-wise analytics', color: 'bg-success/10 text-success', link: null },
  ];

  const isLoading = employeesLoading || leaveLoading;

  // Calculate real stats
  const approvedLeaves = allLeaveRequests.filter(r => r.status === 'approved');
  const totalLeaveDays = approvedLeaves.reduce((sum, r) => sum + Number(r.days), 0);
  const lwpDays = approvedLeaves.filter(r => r.leave_type === 'lwp').reduce((sum, r) => sum + Number(r.days), 0);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Generate and download various reports</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="january">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="january">January 2026</SelectItem>
                <SelectItem value="december">December 2025</SelectItem>
                <SelectItem value="november">November 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl ${report.color}`}>
                    {report.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{report.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{report.desc}</p>
                    <div className="flex gap-2">
                      {report.link ? (
                        <Link to={report.link}>
                          <Button size="sm" className="gap-2">
                            View Report
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Excel
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            PDF
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-primary">{employees.length}</p>
                <p className="text-sm text-muted-foreground">Total Employees</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-secondary">{allLeaveRequests.length}</p>
                <p className="text-sm text-muted-foreground">Leave Requests</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-info">{totalLeaveDays}</p>
                <p className="text-sm text-muted-foreground">Leave Days Taken</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-destructive">{lwpDays}</p>
                <p className="text-sm text-muted-foreground">LWP Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
