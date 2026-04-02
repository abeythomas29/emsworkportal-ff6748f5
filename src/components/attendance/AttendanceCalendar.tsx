import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface AttendanceRecord {
  date: string;
  status: string;
}

interface Holiday {
  date: string;
  name: string;
}

interface AttendanceCalendarProps {
  attendance: AttendanceRecord[];
  holidays?: Holiday[];
  className?: string;
}

export function AttendanceCalendar({ attendance, holidays = [], className }: AttendanceCalendarProps) {
  const holidayDates = holidays.map((h) => new Date(h.date + 'T00:00:00'));

  const presentDates = attendance
    .filter((r) => r.status === 'present')
    .map((r) => new Date(r.date));
  
  const absentDates = attendance
    .filter((r) => r.status === 'absent')
    .map((r) => new Date(r.date));

  const halfDayDates = attendance
    .filter((r) => r.status === 'half_day')
    .map((r) => new Date(r.date));

  const leaveDates = attendance
    .filter((r) => r.status === 'leave')
    .map((r) => new Date(r.date));

  return (
    <div className={cn('space-y-4', className)}>
      <Calendar
        mode="multiple"
        selected={[...presentDates, ...absentDates, ...halfDayDates, ...leaveDates, ...holidayDates]}
        className="rounded-md border pointer-events-auto"
        modifiers={{
          present: presentDates,
          absent: absentDates,
          halfDay: halfDayDates,
          leave: leaveDates,
          holiday: holidayDates,
        }}
        modifiersClassNames={{
          present: 'bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30',
          absent: 'bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-500/30',
          halfDay: 'bg-orange-500/20 text-orange-700 dark:text-orange-400 hover:bg-orange-500/30',
          leave: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-500/30',
          holiday: 'bg-purple-500/20 text-purple-700 dark:text-purple-400 hover:bg-purple-500/30',
        }}
        disabled
      />
      
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
          <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/50" />
          <span className="text-muted-foreground">Leave</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500/20 border border-purple-500/50" />
          <span className="text-muted-foreground">Holiday</span>
        </div>
      </div>
    </div>
  );
}
