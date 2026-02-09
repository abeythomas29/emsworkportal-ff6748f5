import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Loader2,
  Download,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { PolicyDialog } from '@/components/policies/PolicyDialog';
import { LeaveSettingsDialog } from '@/components/policies/LeaveSettingsDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Policy {
  id: string;
  title: string;
  description: string | null;
  category: string;
  content: string | null;
  updated_at: string;
}

interface LeaveSettings {
  id: string;
  casual_leave: number;
  earned_leave: number;
  max_earned_leave: number;
}

export default function PoliciesPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [leaveSettings, setLeaveSettings] = useState<LeaveSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [showLeaveSettingsDialog, setShowLeaveSettingsDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [deletePolicy, setDeletePolicy] = useState<Policy | null>(null);

  const isAdmin = user?.role === 'admin';

  const fetchPolicies = async () => {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching policies:', error);
    } else {
      setPolicies(data || []);
    }
  };

  const fetchLeaveSettings = async () => {
    const { data, error } = await supabase
      .from('default_leave_settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching leave settings:', error);
    } else {
      setLeaveSettings(data);
    }
  };

  useEffect(() => {
    Promise.all([fetchPolicies(), fetchLeaveSettings()]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const handleEditPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowPolicyDialog(true);
  };

  const handleDeletePolicy = async () => {
    if (!deletePolicy) return;

    const { error } = await supabase.from('policies').delete().eq('id', deletePolicy.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete policy',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Policy Deleted',
        description: 'The policy has been deleted.',
      });
      fetchPolicies();
    }
    setDeletePolicy(null);
  };

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
            <h1 className="text-2xl font-bold text-foreground">Policies</h1>
            <p className="text-muted-foreground">
              {isAdmin ? 'Manage company policies and leave rules' : 'View company policies and documents'}
            </p>
          </div>
          {isAdmin && (
            <Button
              className="gap-2"
              onClick={() => {
                setSelectedPolicy(null);
                setShowPolicyDialog(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Add Policy
            </Button>
          )}
        </div>

        {/* HR Policy Document - Visible to everyone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              HR Policy Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Download the official EMS HR Policy document for detailed guidelines on company policies, 
              employee conduct, benefits, and procedures.
            </p>
            <Button asChild variant="outline" className="gap-2">
              <a href="/documents/EMS_HR_Policy.pdf" download="EMS_HR_Policy.pdf">
                <Download className="w-4 h-4" />
                Download HR Policy (PDF)
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Policy Cards - Admin only */}
        {isAdmin && (
          <>
            {policies.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No policies yet</p>
                  <p className="text-sm text-muted-foreground">Create your first policy to get started</p>
                </CardContent>
              </Card>
            ) : (
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditPolicy(policy)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeletePolicy(policy)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {policy.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last updated: {new Date(policy.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Leave Balance Configuration - Admin only */}
        {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Default Leave Balances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-info/10 text-center">
                <p className="text-2xl font-bold text-info">{leaveSettings?.casual_leave ?? 22}</p>
                <p className="text-sm text-muted-foreground">Casual Leave</p>
              </div>
              <div className="p-4 rounded-lg bg-success/10 text-center">
                <p className="text-2xl font-bold text-success">{leaveSettings?.earned_leave ?? 15}</p>
                <p className="text-sm text-muted-foreground">Earned Leave</p>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-2xl font-bold text-foreground">{leaveSettings?.max_earned_leave ?? 45}</p>
                <p className="text-sm text-muted-foreground">Max Earned Leave Carry Forward</p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowLeaveSettingsDialog(true)}>
                Configure Balances
              </Button>
            </div>
          </CardContent>
        </Card>
        )}
      </div>

      {isAdmin && (
        <>
          <PolicyDialog
            open={showPolicyDialog}
        onOpenChange={setShowPolicyDialog}
        policy={selectedPolicy}
        onSuccess={fetchPolicies}
      />

          <LeaveSettingsDialog
            open={showLeaveSettingsDialog}
            onOpenChange={setShowLeaveSettingsDialog}
            settings={leaveSettings}
            onSuccess={fetchLeaveSettings}
          />

          <AlertDialog open={!!deletePolicy} onOpenChange={() => setDeletePolicy(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Policy</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{deletePolicy?.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePolicy} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </DashboardLayout>
  );
}
