import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useProducts, useRawMaterials, useCreateProductionLog } from '@/hooks/useProduction';
import { format } from 'date-fns';

interface MaterialRow {
  raw_material_id: string;
  quantity_consumed: string;
}

export function LogProductionDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [materials, setMaterials] = useState<MaterialRow[]>([{ raw_material_id: '', quantity_consumed: '' }]);

  const { data: products = [] } = useProducts();
  const { data: rawMaterials = [] } = useRawMaterials();
  const createLog = useCreateProductionLog();

  const reset = () => {
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setProductId('');
    setQuantity('');
    setNotes('');
    setMaterials([{ raw_material_id: '', quantity_consumed: '' }]);
  };

  const handleSubmit = async () => {
    if (!productId || !quantity) return;
    await createLog.mutateAsync({
      date,
      product_id: productId,
      quantity_produced: parseFloat(quantity),
      notes,
      materials: materials.map((m) => ({
        raw_material_id: m.raw_material_id,
        quantity_consumed: parseFloat(m.quantity_consumed) || 0,
      })),
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button><Plus className="mr-2 h-4 w-4" />Log Production</Button>}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Production Output</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.filter((p) => p.is_active).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.unit})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Quantity Produced (kg)</Label>
            <Input type="number" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0.00" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Raw Materials Consumed</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMaterials([...materials, { raw_material_id: '', quantity_consumed: '' }])}
              >
                <Plus className="mr-1 h-3 w-3" />Add
              </Button>
            </div>
            {materials.map((m, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_120px_40px] gap-2 items-end">
                <Select
                  value={m.raw_material_id}
                  onValueChange={(v) => {
                    const next = [...materials];
                    next[idx].raw_material_id = v;
                    setMaterials(next);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger>
                  <SelectContent>
                    {rawMaterials.filter((r) => r.is_active).map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name} ({r.unit}) — stock: {r.current_stock}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Qty"
                  value={m.quantity_consumed}
                  onChange={(e) => {
                    const next = [...materials];
                    next[idx].quantity_consumed = e.target.value;
                    setMaterials(next);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setMaterials(materials.filter((_, i) => i !== idx))}
                  disabled={materials.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Batch info, observations..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!productId || !quantity || createLog.isPending}>
            {createLog.isPending ? 'Saving...' : 'Save Production Log'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
