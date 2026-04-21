import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { usePurchaseRequests, type PurchaseRequestUrgency } from '@/hooks/usePurchaseRequests';

interface Props {
  trigger?: React.ReactNode;
}

const UNITS = ['pcs', 'kg', 'g', 'L', 'ml', 'm', 'box', 'pack', 'set', 'other'];

export function NewPurchaseRequestDialog({ trigger }: Props) {
  const { createRequest, isCreating } = usePurchaseRequests();
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState<string>('1');
  const [unit, setUnit] = useState('pcs');
  const [urgency, setUrgency] = useState<PurchaseRequestUrgency>('normal');
  const [reason, setReason] = useState('');

  const reset = () => {
    setItemName('');
    setQuantity('1');
    setUnit('pcs');
    setUrgency('normal');
    setReason('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (!itemName.trim() || isNaN(qty) || qty <= 0) return;
    await createRequest({
      item_name: itemName.trim(),
      quantity: qty,
      unit,
      urgency,
      reason: reason.trim() || undefined,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> New Request
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request an Item</DialogTitle>
          <DialogDescription>
            Submit a purchase request. Admins will review and order it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item">Item name *</Label>
            <Input
              id="item"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Sodium Chloride, Safety Goggles"
              maxLength={200}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity *</Label>
              <Input
                id="qty"
                type="number"
                step="0.01"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id="unit"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency</Label>
            <Select value={urgency} onValueChange={(v) => setUrgency(v as PurchaseRequestUrgency)}>
              <SelectTrigger id="urgency"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason / Notes</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need this? Any specific brand/spec?"
              rows={3}
              maxLength={1000}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Submitting…' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
