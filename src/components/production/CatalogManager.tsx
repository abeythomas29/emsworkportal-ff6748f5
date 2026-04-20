import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import {
  useProducts,
  useRawMaterials,
  useCreateProduct,
  useCreateRawMaterial,
  useDeleteProduct,
  useDeleteRawMaterial,
} from '@/hooks/useProduction';

export function CatalogManager() {
  const { data: products = [] } = useProducts();
  const { data: rawMaterials = [] } = useRawMaterials();
  const createProduct = useCreateProduct();
  const createRaw = useCreateRawMaterial();
  const delProduct = useDeleteProduct();
  const delRaw = useDeleteRawMaterial();

  const [pName, setPName] = useState('');
  const [pStock, setPStock] = useState('');
  const [rName, setRName] = useState('');
  const [rUnit, setRUnit] = useState<'kg' | 'lt'>('kg');
  const [rStock, setRStock] = useState('');

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Products (Finished Goods)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Product name" value={pName} onChange={(e) => setPName(e.target.value)} className="flex-1 min-w-[140px]" />
            <Input type="number" step="0.01" placeholder="Initial stock (kg)" value={pStock} onChange={(e) => setPStock(e.target.value)} className="w-40" />
            <Button
              onClick={async () => {
                if (!pName) return;
                await createProduct.mutateAsync({ name: pName, unit: 'kg', current_stock: parseFloat(pStock) || 0 });
                setPName(''); setPStock('');
              }}
              disabled={!pName || createProduct.isPending}
            >
              <Plus className="mr-1 h-4 w-4" />Add
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Name</TableHead><TableHead>Stock</TableHead><TableHead className="w-12" /></TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{Number(p.current_stock).toFixed(2)} {p.unit}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => delProduct.mutate(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No products yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Raw Materials</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Material name" value={rName} onChange={(e) => setRName(e.target.value)} className="flex-1 min-w-[140px]" />
            <Select value={rUnit} onValueChange={(v) => setRUnit(v as 'kg' | 'lt')}>
              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lt">lt</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" step="0.01" placeholder="Initial stock" value={rStock} onChange={(e) => setRStock(e.target.value)} className="w-32" />
            <Button
              onClick={async () => {
                if (!rName) return;
                await createRaw.mutateAsync({ name: rName, unit: rUnit, current_stock: parseFloat(rStock) || 0 });
                setRName(''); setRStock('');
              }}
              disabled={!rName || createRaw.isPending}
            >
              <Plus className="mr-1 h-4 w-4" />Add
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Name</TableHead><TableHead>Stock</TableHead><TableHead className="w-12" /></TableRow>
            </TableHeader>
            <TableBody>
              {rawMaterials.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>
                    <span className={r.current_stock < 0 ? 'text-destructive font-semibold' : ''}>
                      {Number(r.current_stock).toFixed(2)} {r.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => delRaw.mutate(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rawMaterials.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No raw materials yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
