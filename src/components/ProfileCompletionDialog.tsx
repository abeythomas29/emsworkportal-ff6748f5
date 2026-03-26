import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cake, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ProfileCompletionDialog() {
  const { profile, refreshProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [birthday, setBirthday] = useState('');

  const needsBirthday = !profile?.birthday;

  // Don't show if profile is complete
  if (!profile || !needsBirthday) return null;

  const handleSubmit = async () => {
    if (!birthday) {
      toast.error('Please enter your birthday');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ birthday })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      setIsOpen(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cake className="w-5 h-5 text-primary" />
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            Please fill in the missing details so your team can celebrate with you!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {needsBirthday && (
            <div className="space-y-2">
              <Label htmlFor="birthday" className="flex items-center gap-2">
                <Cake className="w-4 h-4 text-muted-foreground" />
                Birthday
              </Label>
              <Input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Later
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
