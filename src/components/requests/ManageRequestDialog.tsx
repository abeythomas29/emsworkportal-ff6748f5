import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePurchaseRequests, type PurchaseRequest, type PurchaseRequestStatus } from '@/hooks/usePurchaseRequests';

interface Props {
  request: PurchaseRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageRequestDialog({ request, open, onOpenChange }: Props) {
  const { updateOrder, isUpdating } = usePurchaseRequests();
  const [status, setStatus] = useState<PurchaseRequestStatus>('pending');
  const [vendor, setVendor] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    if (request) {
      setStatus(request.status);
      setVendor(request.vendor ?? '');
      setOrderDate(request.order_date ?? '');
      setExpectedDelivery(request.expected_delivery ?? '');
      setOrderNotes(request.order_notes ?? '');
    }
  }, [request]);

  if (!request) return null;

  const handleSave = async () => {
    await updateOrder({
      id: request.id,
      status,
      vendor,
      order_date: orderDate,
      expected_delivery: expectedDelivery,
      order_notes: orderNotes,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Request</DialogTitle>
          <DialogDescription>
            Update the status and order details. The requester will see your updates.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border p-3 bg-muted/30 space-y-1">
          <div className="flex items-center justify-between">
            <p className="font-medium">{request.item_name}</p>
            <Badge variant="secondary">{request.quantity} {request.unit}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Requested by {request.requester_name}
            {request.requester_department ? ` · ${request.requester_department}` : ''}
          </p>
          {request.reason && (
            <p className="text-sm text-muted-foreground pt-1">"{request.reason}"</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PurchaseRequestStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Input id="vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Supplier name" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="od">Order date</Label>
              <Input id="od" type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ed">Expected delivery</Label>
              <Input id="ed" type="date" value={expectedDelivery} onChange={(e) => setExpectedDelivery(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Order notes / update</Label>
            <Textarea
              id="notes"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="PO #, tracking, delays, etc."
              rows={3}
              maxLength={1000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
