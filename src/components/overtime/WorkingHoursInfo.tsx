import { Info, Clock, Timer, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkingHoursInfoProps {
  baseSalary: number;
  workingHours: number;
  otMultiplier: number;
  otHourlyRate: number;
}

export const WorkingHoursInfo = ({
  baseSalary,
  workingHours,
  otMultiplier,
  otHourlyRate,
}: WorkingHoursInfoProps) => {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5 text-primary" />
          Working Hours Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Work Hours</span>
            </div>
            <p className="text-sm font-bold">9:00 AM - 5:30 PM</p>
            <p className="text-xs text-muted-foreground">{workingHours} hours/day</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Timer className="h-4 w-4" />
              <span className="text-xs font-medium">Auto OT</span>
            </div>
            <p className="text-sm font-bold">5:30 PM - 6:00 PM</p>
            <p className="text-xs text-muted-foreground">30 mins auto added</p>
          </div>
        </div>

        <div className="space-y-2 p-3 rounded-lg bg-muted/30">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Your Base Salary</span>
            <span className="text-sm font-bold">₹{baseSalary.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">OT Rate ({otMultiplier}x)</span>
            <span className="text-sm font-bold">₹{otHourlyRate}/hour</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Extra OT before 9 AM or after 6 PM requires admin approval</p>
          <p>• OT Rate = Base ÷ 30 days ÷ {workingHours} hours × {otMultiplier}</p>
        </div>
      </CardContent>
    </Card>
  );
};
