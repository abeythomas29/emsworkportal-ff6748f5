import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { parseSalesWorkbook, ParsedItem } from '@/lib/parseSalesExcel';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

export interface SalesDashboardStats {
  latest_month: string;
  latest_month_label: string;
  this_month: {
    revenue: number;
    invoices: number;
    top_customer: string | null;
  };
  trend: Array<{ month: string; label: string; revenue: number; invoices: number }>;
  top_products: Array<{ name: string; quantity: number; revenue: number }>;
}

export function useSalesStats() {
  return useQuery({
    queryKey: ['sales-dashboard-stats'],
    queryFn: async (): Promise<SalesDashboardStats | null> => {
      const { data, error } = await supabase.rpc('get_sales_dashboard_stats');
      if (error) {
        logError('useSalesStats', error);
        return null;
      }
      return data as unknown as SalesDashboardStats;
    },
  });
}

export function useSalesInvoices() {
  return useQuery({
    queryKey: ['sales-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_invoices')
        .select('*')
        .order('invoice_date', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });
}

export function useSalesUploads() {
  return useQuery({
    queryKey: ['sales-uploads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_uploads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

async function matchProductId(
  itemName: string,
  productMap: Map<string, string>
): Promise<string | null> {
  const norm = normalize(itemName);
  if (productMap.has(norm)) return productMap.get(norm)!;
  // try fuzzy: any product whose normalized name is contained in item or vice versa
  for (const [pNorm, pId] of productMap.entries()) {
    if (pNorm.length > 3 && (norm.includes(pNorm) || pNorm.includes(norm))) return pId;
  }
  return null;
}

export function useUploadSalesExcel() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated');

      const parsed = await parseSalesWorkbook(file);
      if (parsed.invoices.length === 0) {
        throw new Error('No invoices found in the file. Please check the format.');
      }

      // Get existing invoice numbers to skip duplicates
      const invoiceNos = parsed.invoices.map((i) => i.invoice_no);
      const { data: existing } = await supabase
        .from('sales_invoices')
        .select('invoice_no')
        .in('invoice_no', invoiceNos);
      const existingSet = new Set((existing || []).map((e) => e.invoice_no));

      const newInvoices = parsed.invoices.filter((i) => !existingSet.has(i.invoice_no));
      const skipped = parsed.invoices.length - newInvoices.length;

      // Insert invoices
      let inserted: { id: string; invoice_no: string }[] = [];
      if (newInvoices.length > 0) {
        const { data, error } = await supabase
          .from('sales_invoices')
          .insert(
            newInvoices.map((i) => ({
              ...i,
              uploaded_by: user.id,
            }))
          )
          .select('id, invoice_no');
        if (error) throw error;
        inserted = data || [];
      }

      const idByInvoiceNo = new Map(inserted.map((r) => [r.invoice_no, r.id]));

      // Filter items belonging to newly inserted invoices
      const newItems = parsed.items.filter((it) => idByInvoiceNo.has(it.invoice_no));

      // Build product match map
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .eq('is_active', true);
      const productMap = new Map<string, string>();
      (products || []).forEach((p) => productMap.set(normalize(p.name), p.id));

      // Match products
      let matched = 0;
      let stockTotal = 0;
      const itemsToInsert = await Promise.all(
        newItems.map(async (it) => {
          const productId = await matchProductId(it.item_name, productMap);
          if (productId) {
            matched++;
            stockTotal += it.quantity;
          }
          return {
            invoice_id: idByInvoiceNo.get(it.invoice_no)!,
            invoice_no: it.invoice_no,
            invoice_date: it.invoice_date,
            party_name: it.party_name,
            item_name: it.item_name,
            hsn_sac: it.hsn_sac,
            category: it.category,
            description: it.description,
            quantity: it.quantity,
            unit: it.unit,
            unit_price: it.unit_price,
            discount_percent: it.discount_percent,
            discount: it.discount,
            tax_percent: it.tax_percent,
            tax: it.tax,
            amount: it.amount,
            product_id: productId,
          };
        })
      );

      if (itemsToInsert.length > 0) {
        // Insert in chunks of 200
        for (let i = 0; i < itemsToInsert.length; i += 200) {
          const chunk = itemsToInsert.slice(i, i + 200);
          const { error } = await supabase.from('sales_items').insert(chunk);
          if (error) throw error;
        }
      }

      // Log upload
      await supabase.from('sales_uploads').insert({
        uploaded_by: user.id,
        file_name: file.name,
        invoices_inserted: inserted.length,
        invoices_skipped: skipped,
        items_inserted: itemsToInsert.length,
        items_matched_to_products: matched,
        stock_deducted_total: stockTotal,
      });

      return {
        invoicesInserted: inserted.length,
        invoicesSkipped: skipped,
        itemsInserted: itemsToInsert.length,
        itemsMatched: matched,
      };
    },
    onSuccess: (res) => {
      toast.success(
        `Imported ${res.invoicesInserted} invoices (${res.invoicesSkipped} skipped), ${res.itemsInserted} line items, ${res.itemsMatched} matched to products.`
      );
      queryClient.invalidateQueries({ queryKey: ['sales-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales-uploads'] });
      queryClient.invalidateQueries({ queryKey: ['sales-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (e: Error) => {
      logError('useUploadSalesExcel', e);
      toast.error(e.message || 'Failed to import sales file');
    },
  });
}
