import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShoppingCart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRawMaterials } from '@/hooks/useProduction';
import { Progress } from '@/components/ui/progress';

const LOW_STOCK_THRESHOLD = 10;

export function LowStockWidget() {
  const { data: rawMaterials = [], isLoading } = useRawMaterials();

  const lowStock = rawMaterials
    .filter((r) => Number(r.current_stock) < LOW_STOCK_THRESHOLD)
    .sort((a, b) => Number(a.current_stock) - Number(b.current_stock));

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-base font-semibold">Things to Purchase</p>
            <p className="text-xs text-muted-foreground font-normal">
              Raw materials below {LOW_STOCK_THRESHOLD} units
            </p>
          </div>
        </CardTitle>
        <Link to="/production">
          <Button variant="ghost" size="sm" className="text-primary">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : lowStock.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-10 h-10 mx-auto text-success mb-2" />
            <p className="text-sm text-muted-foreground">All raw materials are well stocked.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStock.slice(0, 6).map((r) => {
              const stock = Number(r.current_stock);
              const negative = stock < 0;
              const pct = Math.max(0, Math.min(100, (stock / LOW_STOCK_THRESHOLD) * 100));
              return (
                <div key={r.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {negative && <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />}
                      <span className="text-sm font-medium truncate">{r.name}</span>
                    </div>
                    <Badge
                      variant={negative ? 'destructive' : 'outline'}
                      className={!negative ? 'border-warning text-warning' : ''}
                    >
                      {stock.toFixed(2)} {r.unit}
                    </Badge>
                  </div>
                  <Progress
                    value={pct}
                    className={`h-1.5 ${negative ? '[&>div]:bg-destructive' : '[&>div]:bg-warning'}`}
                  />
                </div>
              );
            })}
            {lowStock.length > 6 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{lowStock.length - 6} more items need restocking
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
