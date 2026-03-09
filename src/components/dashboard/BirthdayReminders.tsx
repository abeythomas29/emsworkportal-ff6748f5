import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cake, PartyPopper } from 'lucide-react';

interface BirthdayEmployee {
  id: string;
  full_name: string;
  birthday: string;
  avatar_url: string | null;
  isToday: boolean;
  daysUntil: number;
}

export function BirthdayReminders() {
  const [birthdays, setBirthdays] = useState<BirthdayEmployee[]>([]);

  useEffect(() => {
    const fetchBirthdays = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, birthday, avatar_url')
        .not('birthday', 'is', null)
        .eq('is_active', true);

      if (error || !data) return;

      const today = new Date();
      const upcoming = data
        .map((p) => {
          const bday = new Date(p.birthday!);
          const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
          
          // If birthday already passed this year, check next year
          if (thisYearBday < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
            thisYearBday.setFullYear(today.getFullYear() + 1);
          }
          
          const diffTime = thisYearBday.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
          const daysUntil = Math.round(diffTime / (1000 * 60 * 60 * 24));

          return {
            id: p.id,
            full_name: p.full_name,
            birthday: p.birthday!,
            avatar_url: p.avatar_url,
            isToday: daysUntil === 0,
            daysUntil,
          };
        })
        .filter((b) => b.daysUntil <= 7) // Show birthdays within next 7 days
        .sort((a, b) => a.daysUntil - b.daysUntil);

      setBirthdays(upcoming);
    };

    fetchBirthdays();
  }, []);

  if (birthdays.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Cake className="w-5 h-5 text-primary" />
          Birthday Celebrations 🎉
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {birthdays.map((b) => (
            <div
              key={b.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                b.isToday
                  ? 'bg-primary/10 border border-primary/30'
                  : 'bg-background/50'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {b.isToday ? (
                  <PartyPopper className="w-5 h-5" />
                ) : (
                  b.full_name.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{b.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {b.isToday
                    ? "🎂 Today is their birthday!"
                    : `Birthday in ${b.daysUntil} day${b.daysUntil > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
