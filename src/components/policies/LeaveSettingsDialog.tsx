import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface LeaveSettings {
  id: string;
  casual_leave: number;
  sick_leave: number;
  earned_leave: number;
}

interface LeaveSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: LeaveSettings | null;
  onSuccess: () => void;
}

export function LeaveSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSuccess,
}: LeaveSettingsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    casualLeave: 12,
    sickLeave: 10,
    earnedLeave: 15,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        casualLeave: settings.casual_leave,
        sickLeave: settings.sick_leave,
        earnedLeave: settings.earned_leave,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (settings) {
        const { error } = await supabase
          .from('default_leave_settings')
          .update({
            casual_leave: formData.casualLeave,
            sick_leave: formData.sickLeave,
            earned_leave: formData.earnedLeave,
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('default_leave_settings').insert({
          casual_leave: formData.casualLeave,
          sick_leave: formData.sickLeave,
          earned_leave: formData.earnedLeave,
        });

        if (error) throw error;
      }

      toast({
        title: 'Settings Updated',
        description: 'Default leave balances have been updated.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Default Leave Balances</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            These values will be assigned to new employees when they join.
          </p>
          <div className="space-y-2">
            <Label htmlFor="casualLeave">Casual Leave (days)</Label>
            <Input
              id="casualLeave"
              type="number"
              min="0"
              value={formData.casualLeave}
              onChange={(e) =>
                setFormData({ ...formData, casualLeave: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sickLeave">Sick Leave (days)</Label>
            <Input
              id="sickLeave"
              type="number"
              min="0"
              value={formData.sickLeave}
              onChange={(e) =>
                setFormData({ ...formData, sickLeave: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="earnedLeave">Earned Leave (days)</Label>
            <Input
              id="earnedLeave"
              type="number"
              min="0"
              value={formData.earnedLeave}
              onChange={(e) =>
                setFormData({ ...formData, earnedLeave: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
