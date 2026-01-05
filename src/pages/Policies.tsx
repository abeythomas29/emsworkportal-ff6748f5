import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  Edit,
  Trash2,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
  lastUpdated: string;
}

const policies: Policy[] = [
  {
    id: '1',
    title: 'Leave Policy',
    description: 'Guidelines for applying leaves, leave types, and carry-forward rules.',
    category: 'Leave',
    lastUpdated: '2024-01-01',
  },
  {
    id: '2',
    title: 'Attendance Policy',
    description: 'Rules for attendance marking, late arrivals, and absence reporting.',
    category: 'Attendance',
    lastUpdated: '2024-01-01',
  },
  {
    id: '3',
    title: 'Work Hours Policy',
    description: 'Guidelines for daily work hour logging and overtime rules.',
    category: 'Work Hours',
    lastUpdated: '2024-01-01',
  },
  {
    id: '4',
    title: 'Holiday Calendar 2024',
    description: 'List of company holidays and optional holidays for the year.',
    category: 'Holidays',
    lastUpdated: '2023-12-15',
  },
];

export default function PoliciesPage() {
  const { user } = useAuth();

  // Only admin can access this
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Policies</h1>
            <p className="text-muted-foreground">Manage company policies and leave rules</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Policy
          </Button>
        </div>

        {/* Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {policies.map((policy) => (
            <Card key={policy.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">{policy.title}</CardTitle>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {policy.category}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{policy.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leave Balance Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Default Leave Balances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-info/10 text-center">
                <p className="text-2xl font-bold text-info">12</p>
                <p className="text-sm text-muted-foreground">Casual Leave</p>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 text-center">
                <p className="text-2xl font-bold text-warning">10</p>
                <p className="text-sm text-muted-foreground">Sick Leave</p>
              </div>
              <div className="p-4 rounded-lg bg-success/10 text-center">
                <p className="text-2xl font-bold text-success">15</p>
                <p className="text-sm text-muted-foreground">Earned Leave</p>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-2xl font-bold text-foreground">∞</p>
                <p className="text-sm text-muted-foreground">LWP (Unlimited)</p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline">Configure Balances</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
