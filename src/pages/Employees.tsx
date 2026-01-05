import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Search,
  UserPlus,
  Filter,
  MoreVertical,
  Mail,
  Building2,
  Loader2,
  Shield,
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEmployees } from '@/hooks/useEmployees';
import { AddEmployeeDialog } from '@/components/employees/AddEmployeeDialog';

export default function EmployeesPage() {
  const { role } = useAuth();
  const { employees, isLoading, refetch } = useEmployees();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Only admin and manager can access this
  if (role !== 'admin' && role !== 'manager') {
    return <Navigate to="/dashboard" replace />;
  }

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesType = typeFilter === 'all' || emp.employee_type === typeFilter;
    return matchesSearch && matchesDept && matchesType;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground">{employees.length} total employees</p>
          </div>
          {role === 'admin' && (
            <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
              <UserPlus className="w-4 h-4" />
              Add Employee
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employees Grid */}
        {filteredEmployees.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No employees found</p>
              <p className="text-sm text-muted-foreground">Employees will appear here when they sign up</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
                        {employee.full_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{employee.full_name}</h3>
                        <div className="flex items-center gap-1">
                          {employee.role === 'admin' && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-destructive/10 text-destructive flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Admin
                            </span>
                          )}
                          {employee.role === 'manager' && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Manager
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/employee/${employee.id}`)}>
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/employee/${employee.id}?tab=attendance`)}>
                          View Attendance
                        </DropdownMenuItem>
                        {role === 'admin' && (
                          <>
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>{employee.department || 'Not assigned'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{employee.employee_id || 'No ID'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        employee.employee_type === 'online' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {employee.employee_type}
                      </span>
                    </div>
                    <StatusBadge status={employee.is_active ? 'approved' : 'rejected'} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddEmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={refetch}
      />
    </DashboardLayout>
  );
}
