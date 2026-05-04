import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type PurchaseRequestStatus = 'pending' | 'approved' | 'ordered' | 'received' | 'rejected';
export type PurchaseRequestUrgency = 'low' | 'normal' | 'high' | 'urgent';

export interface PurchaseRequest {
  id: string;
  user_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  urgency: PurchaseRequestUrgency;
  reason: string | null;
  status: PurchaseRequestStatus;
  vendor: string | null;
  order_date: string | null;
  expected_delivery: string | null;
  order_notes: string | null;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string;
  updated_at: string;
  requester_name?: string;
  requester_department?: string | null;
}

export interface CreatePurchaseRequestInput {
  item_name: string;
  quantity: number;
  unit: string;
  urgency: PurchaseRequestUrgency;
  reason?: string;
}

export interface UpdateOrderInput {
  id: string;
  status: PurchaseRequestStatus;
  vendor?: string | null;
  order_date?: string | null;
  expected_delivery?: string | null;
  order_notes?: string | null;
}

export function usePurchaseRequests() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const requestsQuery = useQuery({
    queryKey: ['purchase-requests'],
    queryFn: async (): Promise<PurchaseRequest[]> => {
      const { data, error } = await supabase
        .from('purchase_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const userIds = Array.from(new Set((data ?? []).map((r) => r.user_id)));
      if (userIds.length === 0) return (data ?? []) as PurchaseRequest[];

      const { data: profiles } = await supabase
        .rpc('get_basic_profiles', { _user_ids: userIds });

      const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      return (data ?? []).map((r) => ({
        ...r,
        requester_name: profileMap.get(r.user_id)?.full_name ?? 'Unknown',
        requester_department: profileMap.get(r.user_id)?.department ?? null,
      })) as PurchaseRequest[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreatePurchaseRequestInput) => {
      if (!user?.id) throw new Error('Not signed in');
      const { error } = await supabase.from('purchase_requests').insert({
        user_id: user.id,
        item_name: input.item_name,
        quantity: input.quantity,
        unit: input.unit,
        urgency: input.urgency,
        reason: input.reason ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      toast.success('Request submitted');
    },
    onError: (err: any) => toast.error(err?.message ?? 'Failed to submit request'),
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (input: UpdateOrderInput) => {
      const patch: Record<string, any> = {
        status: input.status,
        handled_by: user?.id ?? null,
        handled_at: new Date().toISOString(),
      };
      if (input.vendor !== undefined) patch.vendor = input.vendor || null;
      if (input.order_date !== undefined) patch.order_date = input.order_date || null;
      if (input.expected_delivery !== undefined) patch.expected_delivery = input.expected_delivery || null;
      if (input.order_notes !== undefined) patch.order_notes = input.order_notes || null;

      const { error } = await supabase.from('purchase_requests').update(patch).eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      toast.success('Request updated');
    },
    onError: (err: any) => toast.error(err?.message ?? 'Failed to update request'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('purchase_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      toast.success('Request deleted');
    },
    onError: (err: any) => toast.error(err?.message ?? 'Failed to delete request'),
  });

  return {
    requests: requestsQuery.data ?? [],
    isLoading: requestsQuery.isLoading,
    createRequest: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateOrder: updateOrderMutation.mutateAsync,
    isUpdating: updateOrderMutation.isPending,
    deleteRequest: deleteMutation.mutateAsync,
  };
}
