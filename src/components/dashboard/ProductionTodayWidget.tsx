import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Factory, ArrowRight, Package, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProductionLogs } from '@/hooks/useProduction';
import { format, parseISO } from 'date-fns';

export function ProductionTodayWidget() {
  const { data: logs = [], isLoading } = useProductionLogs();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLogs = logs.filter((l) => l.date === today);

  // Fallback: if nothing today, show most recent production date
  let displayLogs = todayLogs;
  let displayDate = today;
  let isToday = true;
  if (todayLogs.length === 0 && logs.length > 0) {
    const sorted = [...logs].sort((a, b) => (a.date < b.date ? 1 : -1));
    displayDate = sorted[0].date;
    displayLogs = logs.filter((l) => l.date === displayDate);
    isToday = false;
  }

  // Aggregate output per product for the displayed date
  const outputByProduct = new Map<string, { name: string; unit: string; qty: number }>();
  displayLogs.forEach((l) => {
    const key = l.product_id;
    const prev = outputByProduct.get(key);
    const name = l.product?.name || 'Unknown';
    const unit = l.product?.unit || '';
    outputByProduct.set(key, {
      name,
      unit,
      qty: (prev?.qty || 0) + Number(l.quantity_produced),
    });
  });
  const displayProducts = Array.from(outputByProduct.values()).sort((a, b) => b.qty - a.qty);
  const totalQty = displayProducts.reduce((s, p) => s + p.qty, 0);
  const maxQty = Math.max(...displayProducts.map((p) => p.qty), 1);
  const totalUnit = displayProducts[0]?.unit || 'kg';

  const headerSubtitle = isToday
    ? format(new Date(), 'EEEE, dd MMM')
    : `Last logged: ${format(parseISO(displayDate), 'EEEE, dd MMM')}`;

  const heroLabel = isToday ? "Today's Output" : 'Latest Output';

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Factory className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold">Production</p>
            <p className="text-xs text-muted-foreground font-normal">{headerSubtitle}</p>
          </div>
        </CardTitle>
        <Link to="/production">
          <Button variant="ghost" size="sm" className="text-primary">
            Open <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No production logged yet.</p>
          </div>
        ) : (
          <>
            {/* Hero total */}
            <div className="rounded-xl bg-gradient-primary text-primary-foreground p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-80">{heroLabel}</p>
                <p className="text-3xl font-bold mt-1">
                  {totalQty.toFixed(2)} <span className="text-lg font-medium opacity-90">{totalUnit}</span>
                </p>
                <p className="text-xs opacity-80 mt-1">
                  Across {displayProducts.length} product{displayProducts.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-7 h-7" />
              </div>
            </div>

            {/* Per product list with quantities */}
            <div className="space-y-3">
              {displayProducts.map((p) => {
                const pct = (p.qty / maxQty) * 100;
                return (
                  <div key={p.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm gap-2">
                      <span className="font-medium truncate flex-1">{p.name}</span>
                      <span className="font-semibold text-foreground whitespace-nowrap">
                        {p.qty.toFixed(2)} {p.unit}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
