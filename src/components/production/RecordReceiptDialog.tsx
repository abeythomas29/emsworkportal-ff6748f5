import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PackagePlus } from 'lucide-react';
import { useProducts, useRawMaterials } from '@/hooks/useProduction';
import { useCreateStockReceipt } from '@/hooks/useStockReceipts';
import { format } from 'date-fns';

export function RecordReceiptDialog() {
  const [open, setOpen] = useState(false);
  const { data: products = [] } = useProducts();
  const { data: rawMaterials = [] } = useRawMaterials();
  const create = useCreateStockReceipt();

  const [itemType, setItemType] = useState<'raw_material' | 'product'>('raw_material');
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [vendor, setVendor] = useState('');
  const [receivedDate, setReceivedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  const selectedUnit = useMemo(() => {
    if (itemType === 'raw_material') return rawMaterials.find((r) => r.id === itemId)?.unit || '';
    return products.find((p) => p.id === itemId)?.unit || '';
  }, [itemType, itemId, rawMaterials, products]);

  useEffect(() => {
    setItemId('');
  }, [itemType]);

  const reset = () => {
    setItemType('raw_material'); setItemId(''); setQuantity('');
    setVendor(''); setReceivedDate(format(new Date(), 'yyyy-MM-dd')); setNotes('');
  };

  const submit = async () => {
    if (!itemId || !quantity || parseFloat(quantity) <= 0) return;
    await create.mutateAsync({
      item_type: itemType,
      raw_material_id: itemType === 'raw_material' ? itemId : null,
      product_id: itemType === 'product' ? itemId : null,
      quantity: parseFloat(quantity),
      unit: selectedUnit,
      vendor: vendor.trim() || null,
      received_date: receivedDate,
      notes: notes.trim() || null,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PackagePlus className="mr-2 h-4 w-4" /> Record Received Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Received Stock</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={itemType} onValueChange={(v) => setItemType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="raw_material">Raw Material</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date Received</Label>
              <Input type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Item</Label>
            <Select value={itemId} onValueChange={setItemId}>
              <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
              <SelectContent>
                {(itemType === 'raw_material' ? rawMaterials : products).map((i: any) => (
                  <SelectItem key={i.id} value={i.id}>{i.name} ({i.unit})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Quantity {selectedUnit && <span className="text-muted-foreground">({selectedUnit})</span>}</Label>
            <Input type="number" step="0.01" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0.00" />
          </div>

          <div className="space-y-1.5">
            <Label>Vendor / Supplier <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g. Acme Chemicals" />
          </div>

          <div className="space-y-1.5">
            <Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Invoice no., batch, etc." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!itemId || !quantity || parseFloat(quantity) <= 0 || create.isPending}>
            Add to Inventory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
