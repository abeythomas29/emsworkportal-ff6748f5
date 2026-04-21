import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserX, Palmtree } from 'lucide-react';

interface LeaveEntry {
  full_name: string;
  department: string | null;
  avatar_url: string | null;
  leave_type: string;
  end_date: string;
}

export function OnLeaveToday() {
  const [onLeave, setOnLeave] = useState<LeaveEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOnLeave = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        leave_type,
        end_date,
        profiles!leave_requests_user_id_fkey (
          full_name,
          department,
          avatar_url
        )
      `)
      .eq('status', 'approved')
      .lte('start_date', today)
      .gte('end_date', today);

    if (error) {
      console.error('Error fetching on-leave data:', error);
      setIsLoading(false);
      return;
    }

    const entries: LeaveEntry[] = (data || []).map((item: any) => ({
      full_name: item.profiles?.full_name || 'Unknown',
      department: item.profiles?.department,
      avatar_url: item.profiles?.avatar_url,
      leave_type: item.leave_type,
      end_date: item.end_date,
    }));

    setOnLeave(entries);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOnLeave();
  }, []);

  const getLeaveLabel = (type: string) => {
    const map: Record<string, string> = { casual: 'Casual', earned: 'Earned', lwp: 'LWP' };
    return map[type] || type;
  };

  if (isLoading) return null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
            <Palmtree className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-base font-semibold">On Leave Today</p>
            <p className="text-xs text-muted-foreground font-normal">
              {onLeave.length === 0 ? 'No one is away' : `${onLeave.length} away`}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {onLeave.length === 0 ? (
          <div className="text-center py-6">
            <UserX className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Everyone is available today!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {onLeave.map((person, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-warning/10 flex items-center justify-center text-warning font-semibold text-sm">
                    {person.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{person.full_name}</p>
                    {person.department && (
                      <p className="text-xs text-muted-foreground">{person.department}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {getLeaveLabel(person.leave_type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    till {new Date(person.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
