import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface OTRequestDialogProps {
  onSubmit: (data: {
    date: string;
    ot_type: string;
    ot_minutes: number;
    notes?: string;
  }) => Promise<boolean>;
}

export const OTRequestDialog = ({ onSubmit }: OTRequestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    ot_type: 'after_6pm',
    hours: '1',
    minutes: '0',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalMinutes = parseInt(formData.hours) * 60 + parseInt(formData.minutes);
    
    if (totalMinutes <= 0 || totalMinutes > 480) {
      toast.error('Invalid OT duration', { description: 'Must be between 1 minute and 8 hours.' });
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit({
      date: formData.date,
      ot_type: formData.ot_type,
      ot_minutes: totalMinutes,
      notes: formData.notes || undefined,
    });

    if (success) {
      setOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        ot_type: 'after_6pm',
        hours: '1',
        minutes: '0',
        notes: '',
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Request OT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Request Overtime</DialogTitle>
          <DialogDescription>
            Submit an OT request for extra hours before 9 AM or after 6 PM.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="ot-date">Date</Label>
            <Input
              id="ot-date"
              type="date"
              value={formData.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>OT Type</Label>
            <Select value={formData.ot_type} onValueChange={(val) => setFormData({ ...formData, ot_type: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before_9am">Before 9:00 AM</SelectItem>
                <SelectItem value="after_6pm">After 6:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ot-hours">Hours</Label>
              <Input
                id="ot-hours"
                type="number"
                min="0"
                max="8"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ot-minutes">Minutes</Label>
              <Input
                id="ot-minutes"
                type="number"
                min="0"
                max="59"
                value={formData.minutes}
                onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ot-notes">Notes (optional)</Label>
            <Textarea
              id="ot-notes"
              placeholder="Reason for overtime..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
