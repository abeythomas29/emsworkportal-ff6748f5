import { cn } from '@/lib/utils';

type StatusType = 'present' | 'absent' | 'pending' | 'approved' | 'rejected' | 'leave' | 'lwp' | 'half-day' | 'holiday' | 'weekend' | 'submitted' | 'flagged';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  present: 'status-present',
  approved: 'status-present',
  submitted: 'status-present',
  absent: 'status-absent',
  rejected: 'status-absent',
  lwp: 'status-absent',
  flagged: 'status-absent',
  pending: 'status-pending',
  'half-day': 'status-pending',
  leave: 'status-leave',
  holiday: 'bg-secondary/20 text-secondary-foreground border border-secondary/30',
  weekend: 'bg-muted text-muted-foreground border border-border',
};

const statusLabels: Record<StatusType, string> = {
  present: 'Present',
  approved: 'Approved',
  submitted: 'Submitted',
  absent: 'Absent',
  rejected: 'Rejected',
  lwp: 'LWP',
  flagged: 'Flagged',
  pending: 'Pending',
  'half-day': 'Half Day',
  leave: 'On Leave',
  holiday: 'Holiday',
  weekend: 'Weekend',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      statusStyles[status],
      className
    )}>
      {statusLabels[status]}
    </span>
  );
}
