import { History, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface OTRequest {
  id: string;
  date: string;
  ot_type: string;
  ot_minutes: number;
  status: string;
}

interface OTHistoryCardProps {
  otRequests: OTRequest[];
  onDelete?: (id: string) => void;
}

export const OTHistoryCard = ({ otRequests, onDelete }: OTHistoryCardProps) => {
  const formatMinutes = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours === 0) return `${remainingMins}m`;
    if (remainingMins === 0) return `${hours}h`;
    return `${hours}h ${remainingMins}m`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-500/10';
      case 'rejected':
        return 'text-red-600 bg-red-500/10';
      default:
        return 'text-yellow-600 bg-yellow-500/10';
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === 'before_9am') return 'Before 9 AM';
    if (type === 'auto_30min') return 'Auto 30min (5:30-6 PM)';
    if (type === 'auto_after_6pm') return 'After 6 PM (Auto)';
    return 'After 6 PM';
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          OT Request History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {otRequests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No OT requests yet</p>
        ) : (
          <div className="space-y-3">
            {otRequests.slice(0, 15).map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(request.date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">{getTypeLabel(request.ot_type)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatMinutes(request.ot_minutes)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  {request.status === 'pending' && onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(request.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
