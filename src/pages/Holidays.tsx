import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHolidays } from '@/hooks/useHolidays';
import { Calendar, Check, X, Loader2, Star, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

export default function HolidaysPage() {
  const {
    isLoading,
    getMandatoryHolidays,
    getOptionalHolidays,
    isHolidaySelected,
    selectHoliday,
    deselectHoliday,
    getSelectedOptionalCount,
  } = useHolidays();

  const mandatoryHolidays = getMandatoryHolidays();
  const optionalHolidays = getOptionalHolidays();
  const selectedCount = getSelectedOptionalCount();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Holidays Calendar</h1>
          <p className="text-muted-foreground">
            View mandatory holidays and select your optional holidays for the year
          </p>
        </div>

        {/* Mandatory Holidays */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-warning" />
              Mandatory Holidays ({mandatoryHolidays.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              These holidays are mandatory for all employees as per Government of India mandate.
            </p>
          </CardHeader>
          <CardContent>
            {mandatoryHolidays.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No mandatory holidays configured</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mandatoryHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-warning/30 bg-warning/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-warning/10">
                        <Calendar className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{holiday.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(holiday.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/30">
                      Mandatory
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Optional Holidays */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Optional Holidays
            </CardTitle>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Select up to 6 optional holidays based on your personal/religious preferences.
              </p>
              <Badge variant={selectedCount >= 6 ? 'default' : 'outline'}>
                {selectedCount}/6 selected
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {optionalHolidays.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No optional holidays configured</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {optionalHolidays.map((holiday) => {
                  const isSelected = isHolidaySelected(holiday.id);
                  return (
                    <div
                      key={holiday.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                          <Calendar className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{holiday.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(holiday.date), 'EEEE, MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() =>
                          isSelected ? deselectHoliday(holiday.id) : selectHoliday(holiday.id)
                        }
                        disabled={!isSelected && selectedCount >= 6}
                        className="gap-1"
                      >
                        {isSelected ? (
                          <>
                            <X className="w-4 h-4" />
                            Remove
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Select
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Holiday Selection Policy</p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>You can select up to 6 optional holidays per year</li>
                  <li>Selection should be intimated to HR at the beginning of the calendar year</li>
                  <li>Mandatory holidays (Republic Day, Independence Day, Gandhi Jayanthi, May Day) are automatic</li>
                  <li>Optional holidays are based on personal/religious preferences</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}