import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePurchaseRequests } from '@/hooks/usePurchaseRequests';
import { NewPurchaseRequestDialog } from '@/components/requests/NewPurchaseRequestDialog';
import { RequestStatusBadge, UrgencyBadge } from '@/components/requests/RequestStatusBadge';

export function PurchaseRequestsWidget() {
  const { requests, isLoading } = usePurchaseRequests();

  const open = requests.filter((r) => r.status !== 'received' && r.status !== 'rejected');
  const recent = open.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Purchase Requests</CardTitle>
              <p className="text-xs text-muted-foreground">{open.length} open · request anything you need</p>
            </div>
          </div>
          <NewPurchaseRequestDialog />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No open requests. Need something? Submit a request.
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 p-2.5 rounded-md border bg-card hover:bg-muted/40 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{r.item_name}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {r.quantity} {r.unit}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    by {r.requester_name}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <UrgencyBadge urgency={r.urgency} className="text-[10px] px-1.5 py-0" />
                  <RequestStatusBadge status={r.status} className="text-[10px] px-1.5 py-0" />
                </div>
              </div>
            ))}
          </div>
        )}

        <Link to="/requests" className="block mt-4">
          <Button variant="ghost" className="w-full justify-between text-primary">
            View all requests
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
