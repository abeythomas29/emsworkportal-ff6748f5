import { Timer, IndianRupee, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOTRequests } from '@/hooks/useOTRequests';
import { useAttendance } from '@/hooks/useAttendance';
import { useMonthlyOTSummary, useOTCalculation } from '@/hooks/useOTCalculation';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const ProductionOTSummary = () => {
  const { otRequests, baseSalary } = useOTRequests();
  const { todayAttendance, attendanceHistory } = useAttendance();

  const dailyOT = useOTCalculation(baseSalary, 8.5, 1.5, todayAttendance, otRequests.filter(r => r.date === new Date().toISOString().split('T')[0]));
  const monthlyStats = useMonthlyOTSummary(baseSalary, 8.5, 1.5, attendanceHistory, otRequests);

  const formatMinutes = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours === 0) return `${remainingMins}m`;
    if (remainingMins === 0) return `${hours}h`;
    return `${hours}h ${remainingMins}m`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          Overtime Summary
        </CardTitle>
        <Link to="/overtime">
          <Button variant="ghost" size="sm" className="text-primary">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's OT */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs text-muted-foreground mb-1">Today's OT</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold text-foreground">
                {formatMinutes(dailyOT.totalApprovedOTMinutes)}
              </span>
            </div>
            <span className="text-sm font-medium text-primary">
              ₹{dailyOT.totalOTPayment.toLocaleString()}
            </span>
          </div>
          {dailyOT.pendingOTMinutes > 0 && (
            <p className="text-xs text-warning mt-1">
              + {formatMinutes(dailyOT.pendingOTMinutes)} pending approval
            </p>
          )}
        </div>

        {/* Monthly OT */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">Monthly OT</span>
            </div>
            <p className="text-lg font-bold text-foreground">{monthlyStats.formattedMonthlyOT}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <IndianRupee className="h-3 w-3" />
              <span className="text-xs">OT Earnings</span>
            </div>
            <p className="text-lg font-bold text-foreground">₹{monthlyStats.totalMonthlyPayment.toLocaleString()}</p>
          </div>
        </div>

        {monthlyStats.monthlyPendingOT > 0 && (
          <p className="text-xs text-center text-warning">
            {formatMinutes(monthlyStats.monthlyPendingOT)} pending approval this month
          </p>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Rate: ₹{monthlyStats.otHourlyRate}/hr • {monthlyStats.daysWorked} days worked
        </p>
      </CardContent>
    </Card>
  );
};
