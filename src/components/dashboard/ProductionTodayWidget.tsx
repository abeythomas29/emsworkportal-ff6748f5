import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Factory, AlertTriangle, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProductionLogs, useRawMaterials } from '@/hooks/useProduction';
import { format } from 'date-fns';

const LOW_STOCK_THRESHOLD = 10;

export function ProductionTodayWidget() {
  const { data: logs = [], isLoading: logsLoading } = useProductionLogs();
  const { data: rawMaterials = [], isLoading: rmLoading } = useRawMaterials();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLogs = logs.filter((l) => l.date === today);

  // Aggregate today's output per product
  const outputByProduct = new Map<string, { name: string; unit: string; qty: number }>();
  todayLogs.forEach((l) => {
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
  const todayProducts = Array.from(outputByProduct.values()).sort((a, b) => b.qty - a.qty);

  const lowStock = rawMaterials
    .filter((r) => Number(r.current_stock) < LOW_STOCK_THRESHOLD)
    .sort((a, b) => Number(a.current_stock) - Number(b.current_stock));

  const isLoading = logsLoading || rmLoading;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Factory className="w-5 h-5 text-primary" />
          Production Today
        </CardTitle>
        <Link to="/production">
          <Button variant="ghost" size="sm" className="text-primary">
            Open <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Today's output */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
            <Package className="w-4 h-4" /> Output ({format(new Date(), 'dd MMM')})
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : todayProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No production logged today.</p>
          ) : (
            <div className="space-y-2">
              {todayProducts.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <span className="font-medium">{p.name}</span>
                  <Badge variant="secondary">
                    {p.qty.toFixed(2)} {p.unit}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock raw materials */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
            <AlertTriangle className="w-4 h-4 text-warning" /> Low Stock (&lt; {LOW_STOCK_THRESHOLD})
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">All raw materials are above threshold.</p>
          ) : (
            <div className="space-y-2">
              {lowStock.slice(0, 5).map((r) => {
                const stock = Number(r.current_stock);
                const negative = stock < 0;
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <span className="font-medium">{r.name}</span>
                    <Badge
                      variant={negative ? 'destructive' : 'outline'}
                      className={!negative ? 'border-warning text-warning' : ''}
                    >
                      {stock.toFixed(2)} {r.unit}
                    </Badge>
                  </div>
                );
              })}
              {lowStock.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{lowStock.length - 5} more
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
