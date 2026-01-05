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
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ReportsPage() {
  const { user } = useAuth();

  // Only admin and manager can access this
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <Navigate to="/dashboard" replace />;
  }

  const reportTypes = [
    { icon: <Calendar className="w-8 h-8" />, title: 'Attendance Report', desc: 'Daily/Monthly attendance summary', color: 'bg-primary/10 text-primary' },
    { icon: <Clock className="w-8 h-8" />, title: 'Work Hours Report', desc: 'Employee work hours breakdown', color: 'bg-secondary/10 text-secondary' },
    { icon: <Users className="w-8 h-8" />, title: 'Leave Report', desc: 'Leave utilization & balances', color: 'bg-info/10 text-info' },
    { icon: <TrendingUp className="w-8 h-8" />, title: 'Performance Report', desc: 'Department-wise analytics', color: 'bg-success/10 text-success' },
  ];

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
                <SelectItem value="january">January 2024</SelectItem>
                <SelectItem value="december">December 2023</SelectItem>
                <SelectItem value="november">November 2023</SelectItem>
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
                      <Button size="sm" variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Excel
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        PDF
                      </Button>
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
              Monthly Overview - January 2024
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-primary">95.2%</p>
                <p className="text-sm text-muted-foreground">Avg. Attendance</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-secondary">3,840</p>
                <p className="text-sm text-muted-foreground">Total Hours Logged</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-info">45</p>
                <p className="text-sm text-muted-foreground">Leaves Taken</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-destructive">8</p>
                <p className="text-sm text-muted-foreground">LWP Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
