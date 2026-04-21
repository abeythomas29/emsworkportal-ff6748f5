import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PurchaseRequestStatus, PurchaseRequestUrgency } from '@/hooks/usePurchaseRequests';

const STATUS_STYLES: Record<PurchaseRequestStatus, string> = {
  pending: 'bg-warning/15 text-warning border-warning/30',
  approved: 'bg-info/15 text-info border-info/30',
  ordered: 'bg-primary/15 text-primary border-primary/30',
  received: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
};

const STATUS_LABELS: Record<PurchaseRequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  ordered: 'Ordered',
  received: 'Received',
  rejected: 'Rejected',
};

export function RequestStatusBadge({ status, className }: { status: PurchaseRequestStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn('border', STATUS_STYLES[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

const URGENCY_STYLES: Record<PurchaseRequestUrgency, string> = {
  low: 'bg-muted text-muted-foreground border-border',
  normal: 'bg-secondary/40 text-secondary-foreground border-secondary/40',
  high: 'bg-warning/15 text-warning border-warning/30',
  urgent: 'bg-destructive/15 text-destructive border-destructive/30',
};

export function UrgencyBadge({ urgency, className }: { urgency: PurchaseRequestUrgency; className?: string }) {
  return (
    <Badge variant="outline" className={cn('border capitalize', URGENCY_STYLES[urgency], className)}>
      {urgency}
    </Badge>
  );
}
