import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSalesStats } from '@/hooks/useSales';
import { Link } from 'react-router-dom';
import { ArrowRight, IndianRupee, FileText, Crown, Loader2, TrendingUp } from 'lucide-react';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function SalesKpiStrip() {
  const { data, isLoading } = useSalesStats();

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Sales Overview</h3>
            <p className="text-xs text-muted-foreground">
              {data?.latest_month_label || 'Latest month'}
            </p>
          </div>
        </div>
        <Link to="/sales">
          <Button variant="ghost" size="sm" className="text-primary">
            View Portal <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      <CardContent className="pt-2 pb-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !data ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No sales data yet. Upload a monthly sales report in the Sales portal.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KpiTile
              icon={<IndianRupee className="w-4 h-4" />}
              label="Total Revenue"
              value={formatCurrency(data.this_month.revenue)}
              accent="primary"
            />
            <KpiTile
              icon={<FileText className="w-4 h-4" />}
              label="Invoices"
              value={String(data.this_month.invoices)}
              accent="secondary"
            />
            <KpiTile
              icon={<Crown className="w-4 h-4" />}
              label="Top Customer"
              value={data.this_month.top_customer || '—'}
              accent="muted"
              truncate
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function KpiTile({
  icon,
  label,
  value,
  accent,
  truncate,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: 'primary' | 'secondary' | 'muted';
  truncate?: boolean;
}) {
  const styles = {
    primary: 'bg-primary/10 border-primary/20 text-primary',
    secondary: 'bg-secondary/10 border-secondary/20 text-secondary-foreground',
    muted: 'bg-muted border-border text-muted-foreground',
  }[accent];

  return (
    <div className={`p-4 rounded-lg border ${styles}`}>
      <div className="flex items-center gap-2 text-xs font-medium opacity-80 mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <p
        className={`text-lg font-bold text-foreground ${truncate ? 'truncate' : ''}`}
        title={truncate ? value : undefined}
      >
        {value}
      </p>
    </div>
  );
}
