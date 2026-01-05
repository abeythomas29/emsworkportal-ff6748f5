import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave' | 'lwp' | 'holiday' | 'weekend';

interface AttendanceDay {
  date: number;
  status: AttendanceStatus | null;
  checkIn?: string;
  checkOut?: string;
}

// Generate mock data for a month
const generateMonthData = (year: number, month: number): AttendanceDay[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: AttendanceDay[] = [];
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dayOfWeek = date.getDay();
    const today = new Date();
    const isPast = date < today;
    
    let status: AttendanceStatus | null = null;
    let checkIn, checkOut;
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      status = 'weekend';
    } else if (isPast) {
      const rand = Math.random();
      if (rand > 0.95) {
        status = 'absent';
      } else if (rand > 0.9) {
        status = 'leave';
      } else if (rand > 0.85) {
        status = 'half-day';
        checkIn = '09:05 AM';
        checkOut = '01:30 PM';
      } else {
        status = 'present';
        checkIn = `09:0${Math.floor(Math.random() * 5)} AM`;
        checkOut = `06:${10 + Math.floor(Math.random() * 20)} PM`;
      }
    }
    
    days.push({ date: i, status, checkIn, checkOut });
  }
  
  return days;
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const statusColors: Record<AttendanceStatus, string> = {
  present: 'bg-success text-success-foreground',
  absent: 'bg-destructive text-destructive-foreground',
  'half-day': 'bg-warning text-warning-foreground',
  leave: 'bg-info text-info-foreground',
  lwp: 'bg-destructive/80 text-destructive-foreground',
  holiday: 'bg-secondary text-secondary-foreground',
  weekend: 'bg-muted text-muted-foreground',
};

export default function AttendancePage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<AttendanceDay | null>(null);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthData = generateMonthData(year, month);
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  // Calculate stats
  const stats = monthData.reduce(
    (acc, day) => {
      if (day.status === 'present') acc.present++;
      else if (day.status === 'absent') acc.absent++;
      else if (day.status === 'leave') acc.leave++;
      else if (day.status === 'half-day') acc.halfDay++;
      return acc;
    },
    { present: 0, absent: 0, leave: 0, halfDay: 0 }
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground">Track your daily attendance and work hours</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-success/10 border-success/20">
            <CardContent className="p-4">
              <p className="text-sm text-success font-medium">Present</p>
              <p className="text-2xl font-bold text-success">{stats.present}</p>
            </CardContent>
          </Card>
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="p-4">
              <p className="text-sm text-destructive font-medium">Absent</p>
              <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
            </CardContent>
          </Card>
          <Card className="bg-info/10 border-info/20">
            <CardContent className="p-4">
              <p className="text-sm text-info font-medium">On Leave</p>
              <p className="text-2xl font-bold text-info">{stats.leave}</p>
            </CardContent>
          </Card>
          <Card className="bg-warning/10 border-warning/20">
            <CardContent className="p-4">
              <p className="text-sm text-warning font-medium">Half Day</p>
              <p className="text-2xl font-bold text-warning">{stats.halfDay}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {monthNames[month]} {year}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={goToPrevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="h-10 flex items-center justify-center text-sm font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before first day of month */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-12" />
                ))}

                {/* Month days */}
                {monthData.map((day) => {
                  const isToday = 
                    day.date === new Date().getDate() &&
                    month === new Date().getMonth() &&
                    year === new Date().getFullYear();

                  return (
                    <button
                      key={day.date}
                      onClick={() => day.status && setSelectedDay(day)}
                      className={cn(
                        'h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all relative',
                        day.status && statusColors[day.status],
                        !day.status && 'bg-muted/30 text-muted-foreground',
                        day.status && 'hover:opacity-80 cursor-pointer',
                        isToday && 'ring-2 ring-primary ring-offset-2'
                      )}
                    >
                      {day.date}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-success" />
                  <span className="text-xs text-muted-foreground">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-destructive" />
                  <span className="text-xs text-muted-foreground">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-warning" />
                  <span className="text-xs text-muted-foreground">Half Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-info" />
                  <span className="text-xs text-muted-foreground">Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-muted" />
                  <span className="text-xs text-muted-foreground">Weekend</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Day Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDay ? (
                <div className="space-y-4">
                  <div className="text-center p-6 rounded-xl bg-muted/50">
                    <p className="text-3xl font-bold text-foreground">{selectedDay.date}</p>
                    <p className="text-muted-foreground">{monthNames[month]} {year}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <StatusBadge status={selectedDay.status!} />
                    </div>
                    
                    {selectedDay.checkIn && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Check In</span>
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {selectedDay.checkIn}
                        </span>
                      </div>
                    )}
                    
                    {selectedDay.checkOut && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Check Out</span>
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {selectedDay.checkOut}
                        </span>
                      </div>
                    )}
                    
                    {selectedDay.checkIn && selectedDay.checkOut && user?.employeeType === 'online' && (
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-sm font-medium text-foreground">Hours Worked</span>
                        <span className="text-lg font-bold text-primary">8.5 hrs</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a day to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
