import { Timer, TrendingUp, IndianRupee, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OTSummaryCardProps {
  monthlyOTMinutes: number;
  pendingOTMinutes: number;
  totalPayment: number;
  otHourlyRate: number;
  formattedMonthlyOT: string;
  formattedPendingOT: string;
  daysWorked: number;
}

export const OTSummaryCard = ({
  monthlyOTMinutes,
  pendingOTMinutes,
  totalPayment,
  otHourlyRate,
  formattedMonthlyOT,
  formattedPendingOT,
  daysWorked,
}: OTSummaryCardProps) => {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Timer className="h-5 w-5 text-primary" />
          Monthly OT Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main OT display */}
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Total OT This Month</p>
          <p className="text-4xl font-bold text-primary mt-1">{formattedMonthlyOT}</p>
          <p className="text-xs text-muted-foreground mt-1">{daysWorked} days worked</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <IndianRupee className="h-3 w-3" />
              <span className="text-xs">OT Payment</span>
            </div>
            <p className="text-lg font-bold text-foreground">₹{totalPayment.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">Hourly Rate</span>
            </div>
            <p className="text-lg font-bold text-foreground">₹{otHourlyRate}</p>
          </div>
        </div>

        {/* Pending OT */}
        {pendingOTMinutes > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Pending Approval</span>
            </div>
            <span className="text-sm font-bold text-warning">{formattedPendingOT}</span>
          </div>
        )}

        {/* OT Formula info */}
        <p className="text-xs text-muted-foreground text-center">
          Formula: Base Salary ÷ 30 ÷ 8.5 hours × 1.5
        </p>
      </CardContent>
    </Card>
  );
};
