import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, IndianRupee, Users, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface EmployeeSalary {
  id: string;
  full_name: string;
  department: string | null;
  base_salary: number;
  employee_type: string;
  approvedOTMinutes: number;
  autoOTMinutes: number;
  otPayment: number;
  totalSalary: number;
}

export default function SalaryPage() {
  const { user, role } = useAuth();
  const isAdminOrManager = role === 'admin' || role === 'manager';

  const [employees, setEmployees] = useState<EmployeeSalary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (!isAdminOrManager) return;

    const fetchSalaryData = async () => {
      setIsLoading(true);
      try {
        const [year, month] = selectedMonth.split('-').map(Number);
        const monthStart = startOfMonth(new Date(year, month - 1));
        const monthEnd = endOfMonth(new Date(year, month - 1));
        const startStr = format(monthStart, 'yyyy-MM-dd');
        const endStr = format(monthEnd, 'yyyy-MM-dd');

        // Fetch all active employees
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, department, base_salary, employee_type')
          .eq('is_active', true)
          .order('full_name');

        if (!profiles) { setIsLoading(false); return; }

        // Fetch approved OT requests for the month (production only)
        const productionIds = profiles.filter(p => p.department?.toLowerCase() === 'production').map(p => p.id);

        let otMap = new Map<string, number>();
        if (productionIds.length > 0) {
          const { data: otData } = await supabase
            .from('ot_requests')
            .select('user_id, ot_minutes')
            .eq('status', 'approved')
            .gte('date', startStr)
            .lte('date', endStr)
            .in('user_id', productionIds);

          (otData || []).forEach(r => {
            otMap.set(r.user_id, (otMap.get(r.user_id) || 0) + r.ot_minutes);
          });
        }

        // Fetch attendance for auto-OT calculation (production)
        let autoOTMap = new Map<string, number>();
        if (productionIds.length > 0) {
          const { data: attData } = await supabase
            .from('attendance')
            .select('user_id, check_out')
            .gte('date', startStr)
            .lte('date', endStr)
            .in('user_id', productionIds)
            .not('check_out', 'is', null);

          (attData || []).forEach(a => {
            if (a.check_out) {
              const checkOutTime = new Date(a.check_out);
              const totalMinutes = checkOutTime.getHours() * 60 + checkOutTime.getMinutes();
              let autoMin = 0;
              if (totalMinutes >= 18 * 60) {
                autoMin = 30;
              } else if (totalMinutes > 17 * 60 + 30) {
                autoMin = totalMinutes - (17 * 60 + 30);
              }
              if (autoMin > 0) {
                autoOTMap.set(a.user_id, (autoOTMap.get(a.user_id) || 0) + autoMin);
              }
            }
          });
        }

        const salaryData: EmployeeSalary[] = profiles.map(p => {
          const isProduction = p.department?.toLowerCase() === 'production';
          const approvedOTMins = isProduction ? (otMap.get(p.id) || 0) : 0;
          const autoOTMins = isProduction ? (autoOTMap.get(p.id) || 0) : 0;
          const totalOTMins = approvedOTMins + autoOTMins;
          const otHourlyRate = (p.base_salary / 30 / 8.5) * 1.5;
          const otPayment = Math.round((totalOTMins / 60) * otHourlyRate * 100) / 100;

          return {
            id: p.id,
            full_name: p.full_name,
            department: p.department,
            base_salary: p.base_salary,
            employee_type: p.employee_type,
            approvedOTMinutes: approvedOTMins,
            autoOTMinutes: autoOTMins,
            otPayment,
            totalSalary: p.base_salary + otPayment,
          };
        });

        setEmployees(salaryData);
      } catch (err) {
        console.error('Error fetching salary data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalaryData();
  }, [isAdminOrManager, selectedMonth]);

  const totals = useMemo(() => {
    const totalBase = employees.reduce((s, e) => s + e.base_salary, 0);
    const totalOT = employees.reduce((s, e) => s + e.otPayment, 0);
    const totalSalary = employees.reduce((s, e) => s + e.totalSalary, 0);
    return { totalBase, totalOT, totalSalary, count: employees.length };
  }, [employees]);

  // Generate month options (last 12 months)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: format(d, 'MMMM yyyy'),
      });
    }
    return options;
  }, []);

  if (!isAdminOrManager) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Salary Overview</h1>
            <p className="text-muted-foreground">Monthly salary breakdown for all employees</p>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{totals.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Base Salary</p>
                  <p className="text-2xl font-bold">₹{totals.totalBase.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total with OT</p>
                  <p className="text-2xl font-bold">₹{totals.totalSalary.toLocaleString('en-IN')}</p>
                  {totals.totalOT > 0 && (
                    <p className="text-xs text-muted-foreground">OT: ₹{totals.totalOT.toLocaleString('en-IN')}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee salary table */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Salary Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-3 font-medium">Employee</th>
                    <th className="text-left py-3 px-3 font-medium">Department</th>
                    <th className="text-right py-3 px-3 font-medium">Base Salary</th>
                    <th className="text-right py-3 px-3 font-medium">OT Hours</th>
                    <th className="text-right py-3 px-3 font-medium">OT Payment</th>
                    <th className="text-right py-3 px-3 font-medium">Total Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const totalOTMins = emp.approvedOTMinutes + emp.autoOTMinutes;
                    return (
                      <tr key={emp.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-3 font-medium">{emp.full_name}</td>
                        <td className="py-3 px-3">
                          <Badge variant="outline">{emp.department || 'Unassigned'}</Badge>
                        </td>
                        <td className="py-3 px-3 text-right">₹{emp.base_salary.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-right">
                          {totalOTMins > 0 ? `${Math.floor(totalOTMins / 60)}h ${totalOTMins % 60}m` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {emp.otPayment > 0 ? `₹${emp.otPayment.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold">₹{emp.totalSalary.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td className="py-3 px-3" colSpan={2}>Total</td>
                    <td className="py-3 px-3 text-right">₹{totals.totalBase.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right"></td>
                    <td className="py-3 px-3 text-right">₹{totals.totalOT.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right">₹{totals.totalSalary.toLocaleString('en-IN')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
