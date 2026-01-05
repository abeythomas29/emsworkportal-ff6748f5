import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Clock, 
  Plus, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

interface WorkLogEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  taskDescription: string;
  status: 'submitted' | 'pending' | 'approved' | 'flagged';
}

const mockWorkLogs: WorkLogEntry[] = [
  {
    id: '1',
    date: '2024-01-15',
    startTime: '09:00',
    endTime: '18:00',
    totalHours: 8,
    taskDescription: 'Worked on dashboard UI components, fixed bugs in attendance module',
    status: 'approved',
  },
  {
    id: '2',
    date: '2024-01-14',
    startTime: '09:30',
    endTime: '18:30',
    totalHours: 8,
    taskDescription: 'API integration for leave management, code review for team',
    status: 'approved',
  },
  {
    id: '3',
    date: '2024-01-13',
    startTime: '09:15',
    endTime: '17:45',
    totalHours: 7.5,
    taskDescription: 'Sprint planning meeting, documentation updates',
    status: 'pending',
  },
];

export default function WorkHoursPage() {
  const { user } = useAuth();
  const [workLogs] = useState<WorkLogEntry[]>(mockWorkLogs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '18:00',
    taskDescription: '',
  });

  // Redirect offline employees
  if (user?.employeeType === 'offline') {
    return <Navigate to="/dashboard" replace />;
  }

  const calculateHours = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return Math.round((endMinutes - startMinutes) / 60 * 10) / 10;
  };

  const totalHours = calculateHours(formData.startTime, formData.endTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (totalHours <= 0 || totalHours > 24) {
      toast.error('Invalid time range', {
        description: 'Please check your start and end times.',
      });
      return;
    }

    if (!formData.taskDescription.trim()) {
      toast.error('Task description required', {
        description: 'Please describe your work for this day.',
      });
      return;
    }

    toast.success('Work hours logged!', {
      description: `${totalHours} hours logged for ${formData.date}`,
    });
    setIsDialogOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '18:00',
      taskDescription: '',
    });
  };

  const monthlyHours = workLogs.reduce((acc, log) => acc + log.totalHours, 0);
  const approvedLogs = workLogs.filter(log => log.status === 'approved').length;
  const pendingLogs = workLogs.filter(log => log.status === 'pending').length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Work Hours</h1>
            <p className="text-muted-foreground">Log and track your daily work hours</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Log Work Hours
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Log Work Hours</DialogTitle>
                <DialogDescription>
                  Record your working hours and tasks for the day.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Hours</span>
                  <span className={`text-xl font-bold ${totalHours > 0 && totalHours <= 24 ? 'text-primary' : 'text-destructive'}`}>
                    {totalHours > 0 ? totalHours : 0} hrs
                  </span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taskDescription">Work Description</Label>
                  <Textarea
                    id="taskDescription"
                    placeholder="Describe the tasks you worked on today..."
                    value={formData.taskDescription}
                    onChange={(e) => setFormData({ ...formData, taskDescription: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Log</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm opacity-80">This Month</p>
                  <p className="text-3xl font-bold">{monthlyHours} hrs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved Logs</p>
                  <p className="text-3xl font-bold text-foreground">{approvedLogs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold text-foreground">{pendingLogs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Work Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hours</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Task Description</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {new Date(log.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {log.startTime} - {log.endTime}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-primary">{log.totalHours} hrs</span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-foreground max-w-md truncate">{log.taskDescription}</p>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={log.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
