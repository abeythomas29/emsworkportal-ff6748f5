import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Loader2, Trash2, Pencil, CalendarDays, Truck, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchaseRequests, type PurchaseRequest, type PurchaseRequestStatus } from '@/hooks/usePurchaseRequests';
import { NewPurchaseRequestDialog } from '@/components/requests/NewPurchaseRequestDialog';
import { ManageRequestDialog } from '@/components/requests/ManageRequestDialog';
import { RequestStatusBadge, UrgencyBadge } from '@/components/requests/RequestStatusBadge';
import { format } from 'date-fns';

const TABS: Array<{ value: 'all' | 'open' | PurchaseRequestStatus; label: string }> = [
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'ordered', label: 'Ordered' },
  { value: 'received', label: 'Received' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

export default function RequestsPage() {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';
  const { requests, isLoading, deleteRequest } = usePurchaseRequests();

  const [tab, setTab] = useState<'all' | 'open' | PurchaseRequestStatus>('open');
  const [search, setSearch] = useState('');
  const [manageTarget, setManageTarget] = useState<PurchaseRequest | null>(null);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (tab === 'open' && (r.status === 'received' || r.status === 'rejected')) return false;
      if (tab !== 'open' && tab !== 'all' && r.status !== tab) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.item_name.toLowerCase().includes(q) ||
          r.requester_name?.toLowerCase().includes(q) ||
          r.vendor?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [requests, tab, search]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Purchase Requests</h1>
              <p className="text-sm text-muted-foreground">
                Request items you need. Admins will order and update progress.
              </p>
            </div>
          </div>
          <NewPurchaseRequestDialog />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center gap-3">
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="flex-1 min-w-0">
              <TabsList className="flex-wrap h-auto">
                {TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Input
              placeholder="Search item, requester, vendor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="lg:w-72"
            />
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-sm text-muted-foreground">
                No requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order info</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => {
                      const isOwner = r.user_id === user?.id;
                      const canEdit = isAdmin;
                      const canDelete = isOwner && r.status === 'pending';
                      return (
                        <TableRow key={r.id} className="align-top">
                          <TableCell className="max-w-[260px]">
                            <div className="font-medium">{r.item_name}</div>
                            {r.reason && (
                              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.reason}</div>
                            )}
                            <div className="text-[11px] text-muted-foreground mt-1">
                              {format(new Date(r.created_at), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {r.quantity} {r.unit}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{r.requester_name}</div>
                            {r.requester_department && (
                              <div className="text-xs text-muted-foreground capitalize">{r.requester_department}</div>
                            )}
                          </TableCell>
                          <TableCell><UrgencyBadge urgency={r.urgency} /></TableCell>
                          <TableCell><RequestStatusBadge status={r.status} /></TableCell>
                          <TableCell className="max-w-[260px]">
                            {r.vendor || r.order_date || r.expected_delivery || r.order_notes ? (
                              <div className="space-y-1 text-xs">
                                {r.vendor && (
                                  <div className="flex items-center gap-1.5">
                                    <Truck className="w-3 h-3 text-muted-foreground" />
                                    <span className="font-medium">{r.vendor}</span>
                                  </div>
                                )}
                                {(r.order_date || r.expected_delivery) && (
                                  <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <CalendarDays className="w-3 h-3" />
                                    <span>
                                      {r.order_date ? `Ordered ${format(new Date(r.order_date), 'MMM d')}` : ''}
                                      {r.order_date && r.expected_delivery ? ' · ' : ''}
                                      {r.expected_delivery ? `ETA ${format(new Date(r.expected_delivery), 'MMM d')}` : ''}
                                    </span>
                                  </div>
                                )}
                                {r.order_notes && (
                                  <div className="flex items-start gap-1.5 text-muted-foreground">
                                    <FileText className="w-3 h-3 mt-0.5 shrink-0" />
                                    <span className="line-clamp-2">{r.order_notes}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {canEdit && (
                              <Button variant="ghost" size="sm" onClick={() => setManageTarget(r)}>
                                <Pencil className="w-4 h-4 mr-1" /> Manage
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteRequest(r.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ManageRequestDialog
        request={manageTarget}
        open={!!manageTarget}
        onOpenChange={(o) => { if (!o) setManageTarget(null); }}
      />
    </DashboardLayout>
  );
}
