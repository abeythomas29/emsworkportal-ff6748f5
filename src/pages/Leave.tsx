import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Plus, Clock, History } from 'lucide-react';
import { toast } from 'sonner';

interface LeaveBalance {
  type: string;
  label: string;
  total: number;
  used: number;
  remaining: number;
  color: string;
}

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
}

const leaveBalances: LeaveBalance[] = [
  { type: 'casual', label: 'Casual Leave', total: 12, used: 4, remaining: 8, color: 'bg-info' },
  { type: 'sick', label: 'Sick Leave', total: 10, used: 2, remaining: 8, color: 'bg-warning' },
  { type: 'earned', label: 'Earned Leave', total: 15, used: 5, remaining: 10, color: 'bg-success' },
  { type: 'lwp', label: 'LWP Taken', total: 0, used: 1, remaining: 0, color: 'bg-destructive' },
];

const leaveHistory: LeaveRequest[] = [
  {
    id: '1',
    type: 'Casual Leave',
    startDate: '2024-01-20',
    endDate: '2024-01-21',
    days: 2,
    reason: 'Personal work',
    status: 'approved',
    appliedOn: '2024-01-15',
  },
  {
    id: '2',
    type: 'Sick Leave',
    startDate: '2024-01-10',
    endDate: '2024-01-10',
    days: 1,
    reason: 'Not feeling well',
    status: 'approved',
    appliedOn: '2024-01-10',
  },
  {
    id: '3',
    type: 'Earned Leave',
    startDate: '2024-02-05',
    endDate: '2024-02-09',
    days: 5,
    reason: 'Family vacation',
    status: 'pending',
    appliedOn: '2024-01-25',
  },
];

export default function LeavePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    isHalfDay: false,
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leaveType || !formData.startDate || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    toast.success('Leave application submitted!', {
      description: 'Your request has been sent for approval.',
    });
    setIsDialogOpen(false);
    setFormData({
      leaveType: '',
      startDate: '',
      endDate: '',
      isHalfDay: false,
      reason: '',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
            <p className="text-muted-foreground">Apply for leave and track your balance</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Apply for Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogDescription>
                  Submit your leave request for approval.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select
                    value={formData.leaveType}
                    onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual Leave (8 remaining)</SelectItem>
                      <SelectItem value="sick">Sick Leave (8 remaining)</SelectItem>
                      <SelectItem value="earned">Earned Leave (10 remaining)</SelectItem>
                      <SelectItem value="lwp">Leave Without Pay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">From Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">To Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="halfDay"
                    checked={formData.isHalfDay}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, isHalfDay: checked as boolean })
                    }
                  />
                  <Label htmlFor="halfDay" className="text-sm font-normal cursor-pointer">
                    Half Day Leave
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Provide a reason for your leave..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Application</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Leave Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leaveBalances.map((balance) => (
            <Card key={balance.type} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${balance.color}`} />
              <CardContent className="pt-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{balance.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{balance.remaining}</p>
                    <p className="text-xs text-muted-foreground">days remaining</p>
                  </div>
                  <div className={`p-2 rounded-lg ${balance.color}/10`}>
                    <Calendar className={`w-5 h-5 ${balance.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${balance.color} transition-all duration-500`}
                    style={{ width: `${balance.total > 0 ? (balance.remaining / balance.total) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Used: {balance.used}</span>
                  <span>Total: {balance.total}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leave History */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveHistory.map((leave) => (
                <div
                  key={leave.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-muted/50 gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{leave.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(leave.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                        {leave.endDate !== leave.startDate && (
                          <>
                            {' - '}
                            {new Date(leave.endDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </>
                        )}
                        {' • '}{leave.days} day{leave.days > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{leave.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:flex-col md:items-end">
                    <StatusBadge status={leave.status} />
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Applied: {new Date(leave.appliedOn).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
