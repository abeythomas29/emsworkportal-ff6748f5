import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logError } from '@/lib/logger';

export interface StockReceipt {
  id: string;
  user_id: string;
  item_type: 'raw_material' | 'product';
  raw_material_id: string | null;
  product_id: string | null;
  quantity: number;
  unit: string;
  vendor: string | null;
  received_date: string;
  purchase_request_id: string | null;
  notes: string | null;
  created_at: string;
  raw_material?: { name: string; unit: string } | null;
  product?: { name: string; unit: string } | null;
  receiver?: { full_name: string };
}

export function useStockReceipts() {
  return useQuery({
    queryKey: ['stock_receipts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_receipts')
        .select('*, raw_material:raw_materials(name, unit), product:products(name, unit)')
        .order('received_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;

      const userIds = Array.from(new Set((data || []).map((r) => r.user_id)));
      const { data: profiles } = userIds.length
        ? await supabase.from('profiles').select('id, full_name').in('id', userIds)
        : { data: [] as any[] };
      const map = new Map((profiles || []).map((p: any) => [p.id, p.full_name]));

      return (data || []).map((r: any) => ({
        ...r,
        receiver: { full_name: map.get(r.user_id) || 'Unknown' },
      })) as StockReceipt[];
    },
  });
}

export function useCreateStockReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      item_type: 'raw_material' | 'product';
      raw_material_id?: string | null;
      product_id?: string | null;
      quantity: number;
      unit: string;
      vendor?: string | null;
      received_date: string;
      purchase_request_id?: string | null;
      notes?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('stock_receipts').insert({
        user_id: user.id,
        item_type: input.item_type,
        raw_material_id: input.item_type === 'raw_material' ? input.raw_material_id : null,
        product_id: input.item_type === 'product' ? input.product_id : null,
        quantity: input.quantity,
        unit: input.unit,
        vendor: input.vendor || null,
        received_date: input.received_date,
        purchase_request_id: input.purchase_request_id || null,
        notes: input.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock_receipts'] });
      qc.invalidateQueries({ queryKey: ['raw_materials'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Stock received', description: 'Inventory updated.' });
    },
    onError: (e: any) => {
      logError('createStockReceipt', e);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });
}

export function useDeleteStockReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stock_receipts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock_receipts'] });
      qc.invalidateQueries({ queryKey: ['raw_materials'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Receipt deleted', description: 'Inventory reverted.' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}
