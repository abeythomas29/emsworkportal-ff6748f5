import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAttendance } from '@/hooks/useAttendance';
import { LogIn, LogOut, Clock, Timer, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function CheckInOutCard() {
  const {
    todayAttendance,
    isCheckingIn,
    isCheckingOut,
    checkIn,
    checkOut,
    getWorkingTime,
  } = useAttendance();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [workingTime, setWorkingTime] = useState('0h 0m');

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (todayAttendance?.check_in && !todayAttendance?.check_out) {
        setWorkingTime(getWorkingTime());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [todayAttendance, getWorkingTime]);

  useEffect(() => {
    setWorkingTime(getWorkingTime());
  }, [todayAttendance, getWorkingTime]);

  const isCheckedIn = !!todayAttendance?.check_in;
  const isCheckedOut = !!todayAttendance?.check_out;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-primary text-primary-foreground pb-8">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5" />
          Time Tracking
        </CardTitle>
        <div className="mt-4">
          <p className="text-4xl font-bold tracking-tight">
            {format(currentTime, 'HH:mm:ss')}
          </p>
          <p className="text-sm opacity-80 mt-1">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Reminder */}
        {!isCheckedIn && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
            <p className="font-medium">Reminder</p>
            <p className="text-xs opacity-80">Please check in when you arrive and check out when you leave.</p>
          </div>
        )}

        {/* Status Display */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isCheckedIn && !isCheckedOut
                  ? 'bg-success animate-pulse'
                  : isCheckedOut
                  ? 'bg-muted-foreground'
                  : 'bg-warning'
              }`}
            />
            <div>
              <p className="font-medium text-foreground">
                {isCheckedIn && !isCheckedOut
                  ? 'Currently Working'
                  : isCheckedOut
                  ? 'Day Complete'
                  : 'Not Checked In'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isCheckedIn
                  ? `Checked in at ${format(new Date(todayAttendance!.check_in!), 'h:mm a')}`
                  : 'Start your workday'}
              </p>
            </div>
          </div>
          {isCheckedIn && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-primary">
                <Timer className="w-4 h-4" />
                <span className="font-mono font-bold">{workingTime}</span>
              </div>
              <p className="text-xs text-muted-foreground">Working time</p>
            </div>
          )}
        </div>

        {/* Check-in/out times */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Check-in</p>
            <p className="font-semibold text-foreground">
              {todayAttendance?.check_in
                ? format(new Date(todayAttendance.check_in), 'h:mm a')
                : '--:--'}
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Check-out</p>
            <p className="font-semibold text-foreground">
              {todayAttendance?.check_out
                ? format(new Date(todayAttendance.check_out), 'h:mm a')
                : '--:--'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={checkIn}
            disabled={isCheckedIn || isCheckingIn}
            className="flex-1 h-12"
            variant={isCheckedIn ? 'outline' : 'default'}
          >
            {isCheckingIn ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4 mr-2" />
            )}
            {isCheckingIn ? 'Checking in...' : isCheckedIn ? 'Checked In' : 'Check In'}
          </Button>
          <Button
            onClick={checkOut}
            disabled={!isCheckedIn || isCheckedOut || isCheckingOut}
            className="flex-1 h-12"
            variant={isCheckedOut ? 'outline' : 'secondary'}
          >
            {isCheckingOut ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            {isCheckingOut ? 'Checking out...' : isCheckedOut ? 'Checked Out' : 'Check Out'}
          </Button>
        </div>

        {/* Total hours for today */}
        {isCheckedOut && todayAttendance?.total_hours && (
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-success font-medium">Day Complete</p>
                <p className="text-xs text-muted-foreground">Total time worked today</p>
              </div>
              <p className="text-2xl font-bold text-success">
                {todayAttendance.total_hours.toFixed(1)}h
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
