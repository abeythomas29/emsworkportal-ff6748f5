import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { format, isSameMonth } from 'date-fns';

interface AttendanceRecord {
  date: string;
  status: string;
}

interface Holiday {
  date: string;
  name: string;
}

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
}

interface AttendanceCalendarProps {
  attendance: AttendanceRecord[];
  holidays?: Holiday[];
  leaveRequests?: LeaveRequest[];
  className?: string;
}

export function AttendanceCalendar({ attendance, holidays = [], leaveRequests = [], className }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const holidayDates = holidays.map((h) => new Date(h.date + 'T00:00:00'));

  const presentDates = attendance
    .filter((r) => r.status === 'present')
    .map((r) => new Date(r.date + 'T00:00:00'));
  
  const absentDates = attendance
    .filter((r) => r.status === 'absent')
    .map((r) => new Date(r.date + 'T00:00:00'));

  // Implicit absent: past working days in viewed month with no attendance/leave/holiday record
  const implicitAbsentDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recordedDates = new Set(attendance.map((r) => r.date));
    const holidaySet = new Set(holidays.map((h) => h.date));

    const approvedLeaveSet = new Set<string>();
    leaveRequests
      .filter((lr) => lr.status === 'approved')
      .forEach((lr) => {
        const start = new Date(lr.start_date + 'T00:00:00');
        const end = new Date(lr.end_date + 'T00:00:00');
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          approvedLeaveSet.add(ds);
        }
      });

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: Date[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      if (d >= today) continue;
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue;
      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (recordedDates.has(ds)) continue;
      if (holidaySet.has(ds)) continue;
      if (approvedLeaveSet.has(ds)) continue;
      result.push(d);
    }
    return result;
  }, [attendance, holidays, leaveRequests, currentMonth]);

  const allAbsentDates = [...absentDates, ...implicitAbsentDates];

  const halfDayDates = attendance
    .filter((r) => r.status === 'half_day')
    .map((r) => new Date(r.date + 'T00:00:00'));

  // Build leave dates from approved leave requests, split by type
  const { clDates, elDates, lwpDates } = useMemo(() => {
    const cl: Date[] = [];
    const el: Date[] = [];
    const lwp: Date[] = [];
    leaveRequests
      .filter((lr) => lr.status === 'approved')
      .forEach((lr) => {
        const start = new Date(lr.start_date + 'T00:00:00');
        const end = new Date(lr.end_date + 'T00:00:00');
        const bucket =
          lr.leave_type === 'casual' ? cl :
          lr.leave_type === 'earned' ? el :
          lr.leave_type === 'lwp' ? lwp : cl;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          bucket.push(new Date(d));
        }
      });
    // Also include leave status from attendance records (treat plain "leave" as CL)
    attendance.forEach((r) => {
      const d = new Date(r.date + 'T00:00:00');
      if (r.status === 'leave') cl.push(d);
      else if (r.status === 'lwp') lwp.push(d);
    });
    return { clDates: cl, elDates: el, lwpDates: lwp };
  }, [leaveRequests, attendance]);

  // Monthly summary
  const monthlySummary = useMemo(() => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    let presentCount = 0;
    let absentCount = 0;
    let halfDayCount = 0;
    let clUsed = 0;
    let elUsed = 0;
    let lwpCount = 0;
    let holidayCount = 0;

    // Count from attendance records
    attendance.forEach((r) => {
      const d = new Date(r.date + 'T00:00:00');
      if (!isSameMonth(d, monthStart)) return;
      if (r.status === 'present') presentCount++;
      else if (r.status === 'absent') absentCount++;
      else if (r.status === 'half_day') halfDayCount++;
      else if (r.status === 'lwp') lwpCount++;
    });

    // Count from approved leave requests
    leaveRequests
      .filter((lr) => lr.status === 'approved')
      .forEach((lr) => {
        const start = new Date(lr.start_date + 'T00:00:00');
        const end = new Date(lr.end_date + 'T00:00:00');
        let daysInMonth = 0;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (isSameMonth(d, monthStart)) daysInMonth++;
        }
        if (daysInMonth > 0) {
          if (lr.leave_type === 'casual') clUsed += daysInMonth;
          else if (lr.leave_type === 'earned') elUsed += daysInMonth;
          else if (lr.leave_type === 'lwp') lwpCount += daysInMonth;
        }
      });

    // Count holidays in month
    holidays.forEach((h) => {
      const d = new Date(h.date + 'T00:00:00');
      if (isSameMonth(d, monthStart)) holidayCount++;
    });

    // Add implicit absents (past working days with no record/leave/holiday) in this month
    implicitAbsentDates.forEach((d) => {
      if (isSameMonth(d, monthStart)) absentCount++;
    });

    return { presentCount, absentCount, halfDayCount, clUsed, elUsed, lwpCount, holidayCount };
  }, [attendance, leaveRequests, holidays, currentMonth, implicitAbsentDates]);

  return (
    <div className={cn('space-y-4', className)}>
      <Calendar
        mode="multiple"
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        className="rounded-md border pointer-events-auto"
        classNames={{
          day_selected: '',
        }}
        modifiers={{
          present: presentDates,
          absent: allAbsentDates,
          halfDay: halfDayDates,
          casualLeave: clDates,
          earnedLeave: elDates,
          lwp: lwpDates,
          holiday: holidayDates,
        }}
        modifiersClassNames={{
          present: '!bg-green-500/20 !text-green-700 dark:!text-green-400',
          absent: '!bg-red-500/20 !text-red-700 dark:!text-red-400',
          halfDay: '!bg-orange-500/20 !text-orange-700 dark:!text-orange-400',
          casualLeave: '!bg-yellow-400/30 !text-yellow-800 dark:!text-yellow-300',
          earnedLeave: '!bg-blue-500/20 !text-blue-700 dark:!text-blue-400',
          lwp: '!bg-orange-600/30 !text-orange-800 dark:!text-orange-300',
          holiday: '!bg-purple-500/20 !text-purple-700 dark:!text-purple-400',
        }}
        disabled
      />

      {/* Monthly Summary */}
      <Card className="border-border">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            {format(currentMonth, 'MMMM yyyy')} Summary
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between p-2 rounded bg-green-500/10">
              <span className="text-muted-foreground">Present</span>
              <span className="font-semibold text-green-700 dark:text-green-400">{monthlySummary.presentCount}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-red-500/10">
              <span className="text-muted-foreground">Absent</span>
              <span className="font-semibold text-red-700 dark:text-red-400">{monthlySummary.absentCount}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-primary/10">
              <span className="text-muted-foreground">CL Used</span>
              <span className="font-semibold text-primary">{monthlySummary.clUsed}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-orange-500/10">
              <span className="text-muted-foreground">LWP</span>
              <span className="font-semibold text-orange-700 dark:text-orange-400">{monthlySummary.lwpCount}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-blue-500/10">
              <span className="text-muted-foreground">EL Used</span>
              <span className="font-semibold text-blue-700 dark:text-blue-400">{monthlySummary.elUsed}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-purple-500/10">
              <span className="text-muted-foreground">Holidays</span>
              <span className="font-semibold text-purple-700 dark:text-purple-400">{monthlySummary.holidayCount}</span>
            </div>
            {monthlySummary.halfDayCount > 0 && (
              <div className="flex justify-between p-2 rounded bg-orange-500/10">
                <span className="text-muted-foreground">Half Day</span>
                <span className="font-semibold text-orange-700 dark:text-orange-400">{monthlySummary.halfDayCount}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/50" />
          <span className="text-muted-foreground">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/50" />
          <span className="text-muted-foreground">Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/50" />
          <span className="text-muted-foreground">Half Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-400/30 border border-yellow-500/50" />
          <span className="text-muted-foreground">CL</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/50" />
          <span className="text-muted-foreground">EL</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-600/30 border border-orange-600/50" />
          <span className="text-muted-foreground">LWP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500/20 border border-purple-500/50" />
          <span className="text-muted-foreground">Holiday</span>
        </div>
      </div>
    </div>
  );
}
