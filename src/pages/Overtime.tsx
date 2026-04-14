import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useOTRequests } from '@/hooks/useOTRequests';
import { useAttendance } from '@/hooks/useAttendance';
import { useMonthlyOTSummary } from '@/hooks/useOTCalculation';
import { OTSummaryCard } from '@/components/overtime/OTSummaryCard';
import { OTHistoryCard } from '@/components/overtime/OTHistoryCard';
import { OTRequestDialog } from '@/components/overtime/OTRequestDialog';
import { WorkingHoursInfo } from '@/components/overtime/WorkingHoursInfo';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function OvertimePage() {
  const { user } = useAuth();
  const { otRequests, baseSalary, isLoading: otLoading, submitOTRequest, deleteOTRequest } = useOTRequests();
  const { attendanceHistory, isLoading: attLoading } = useAttendance();

  const monthlyStats = useMonthlyOTSummary(
    baseSalary,
    8.5,
    1.5,
    attendanceHistory,
    otRequests
  );

  // Only allow production department (after all hooks)
  if (user && user.department?.toLowerCase() !== 'production') {
    return <Navigate to="/dashboard" replace />;
  }

  if (otLoading || attLoading) {
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
            <h1 className="text-2xl font-bold text-foreground">Overtime Calculator</h1>
            <p className="text-muted-foreground">Track your overtime hours and earnings</p>
          </div>
          <OTRequestDialog onSubmit={submitOTRequest} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OTSummaryCard
            monthlyOTMinutes={monthlyStats.totalMonthlyOTMinutes}
            pendingOTMinutes={monthlyStats.monthlyPendingOT}
            totalPayment={monthlyStats.totalMonthlyPayment}
            otHourlyRate={monthlyStats.otHourlyRate}
            formattedMonthlyOT={monthlyStats.formattedMonthlyOT}
            formattedPendingOT={monthlyStats.formattedPendingOT}
            daysWorked={monthlyStats.daysWorked}
          />
          <WorkingHoursInfo
            baseSalary={baseSalary}
            workingHours={8.5}
            otMultiplier={1.5}
            otHourlyRate={monthlyStats.otHourlyRate}
          />
        </div>

        <OTHistoryCard otRequests={otRequests} onDelete={deleteOTRequest} />
      </div>
    </DashboardLayout>
  );
}
