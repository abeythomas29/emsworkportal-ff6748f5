import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
}

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: 'EMP005',
    employeeName: 'John Smith',
    department: 'Engineering',
    type: 'Casual Leave',
    startDate: '2024-01-25',
    endDate: '2024-01-26',
    days: 2,
    reason: 'Personal work - need to visit bank and complete some paperwork',
    status: 'pending',
    appliedOn: '2024-01-20',
  },
  {
    id: '2',
    employeeId: 'EMP008',
    employeeName: 'Emma Wilson',
    department: 'Marketing',
    type: 'Sick Leave',
    startDate: '2024-01-22',
    endDate: '2024-01-22',
    days: 1,
    reason: 'Not feeling well, need rest',
    status: 'pending',
    appliedOn: '2024-01-22',
  },
  {
    id: '3',
    employeeId: 'EMP012',
    employeeName: 'Michael Brown',
    department: 'Sales',
    type: 'Earned Leave',
    startDate: '2024-02-01',
    endDate: '2024-02-05',
    days: 5,
    reason: 'Family vacation planned for a long time',
    status: 'pending',
    appliedOn: '2024-01-18',
  },
  {
    id: '4',
    employeeId: 'EMP015',
    employeeName: 'Sarah Johnson',
    department: 'HR',
    type: 'Casual Leave',
    startDate: '2024-01-15',
    endDate: '2024-01-15',
    days: 1,
    reason: 'Doctors appointment',
    status: 'approved',
    appliedOn: '2024-01-12',
  },
  {
    id: '5',
    employeeId: 'EMP020',
    employeeName: 'David Lee',
    department: 'Operations',
    type: 'Sick Leave',
    startDate: '2024-01-10',
    endDate: '2024-01-11',
    days: 2,
    reason: 'Fever and cold',
    status: 'approved',
    appliedOn: '2024-01-10',
  },
];

export default function LeaveRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Only admin and manager can access this
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleApprove = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'approved' as const } : req
    ));
    toast.success('Leave request approved');
  };

  const handleReject = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
    toast.error('Leave request rejected');
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leave Requests</h1>
            <p className="text-muted-foreground">
              {pendingCount} pending request{pendingCount !== 1 ? 's' : ''} awaiting approval
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className={request.status === 'pending' ? 'border-warning/30' : ''}>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                      {request.employeeName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-foreground">{request.employeeName}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {request.employeeId}
                        </span>
                        <span className="text-xs text-muted-foreground">{request.department}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-medium text-sm">{request.type}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {request.startDate !== request.endDate && (
                            <> - {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                          )}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm font-medium text-primary">{request.days} day{request.days > 1 ? 's' : ''}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{request.reason}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Applied on {new Date(request.appliedOn).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <StatusBadge status={request.status} />
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(request.id)}
                          className="text-success border-success hover:bg-success hover:text-success-foreground"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request.id)}
                          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredRequests.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No leave requests found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
