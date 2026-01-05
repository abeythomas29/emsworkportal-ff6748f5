import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface AttendanceRecord {
  date: string;
  status: string;
}

interface AttendanceCalendarProps {
  attendance: AttendanceRecord[];
  className?: string;
}

export function AttendanceCalendar({ attendance, className }: AttendanceCalendarProps) {
  // Create a map of dates to status for quick lookup
  const attendanceMap = new Map(
    attendance.map((record) => [record.date, record.status])
  );

  // Get all dates with attendance records
  const presentDates = attendance
    .filter((r) => r.status === 'present')
    .map((r) => new Date(r.date));
  
  const absentDates = attendance
    .filter((r) => r.status === 'absent')
    .map((r) => new Date(r.date));

  const lateDates = attendance
    .filter((r) => r.status === 'late')
    .map((r) => new Date(r.date));

  const halfDayDates = attendance
    .filter((r) => r.status === 'half_day')
    .map((r) => new Date(r.date));

  return (
    <div className={cn('space-y-4', className)}>
      <Calendar
        mode="multiple"
        selected={[...presentDates, ...absentDates, ...lateDates, ...halfDayDates]}
        className="rounded-md border pointer-events-auto"
        modifiers={{
          present: presentDates,
          absent: absentDates,
          late: lateDates,
          halfDay: halfDayDates,
        }}
        modifiersClassNames={{
          present: 'bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30',
          absent: 'bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-500/30',
          late: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/30',
          halfDay: 'bg-orange-500/20 text-orange-700 dark:text-orange-400 hover:bg-orange-500/30',
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
          <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/50" />
          <span className="text-muted-foreground">Late</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/50" />
          <span className="text-muted-foreground">Half Day</span>
        </div>
      </div>
    </div>
  );
}
