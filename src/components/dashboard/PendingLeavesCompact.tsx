import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Check, X, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLeave } from '@/hooks/useLeave';

export function PendingLeavesCompact() {
  const { allLeaveRequests, approveLeave, rejectLeave } = useLeave();
  const pending = allLeaveRequests.filter((r) => r.status === 'pending');

  const labelMap: Record<string, string> = { casual: 'Casual', earned: 'Earned', lwp: 'LWP' };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-base font-semibold">Pending Leaves</p>
            <p className="text-xs text-muted-foreground font-normal">
              {pending.length} awaiting approval
            </p>
          </div>
        </CardTitle>
        <Link to="/leave-requests">
          <Button variant="ghost" size="sm" className="text-primary">
            All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-10 h-10 mx-auto text-success mb-2" />
            <p className="text-sm text-muted-foreground">All caught up — no pending requests.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.slice(0, 4).map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
                  {r.profiles?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {r.profiles?.full_name || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {labelMap[r.leave_type] || r.leave_type} • {r.days} day{Number(r.days) > 1 ? 's' : ''} •{' '}
                    {new Date(r.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => approveLeave(r.id)}
                    className="h-7 w-7 text-success hover:bg-success/10"
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => rejectLeave(r.id)}
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {pending.length > 4 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{pending.length - 4} more pending
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
