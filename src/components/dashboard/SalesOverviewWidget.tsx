import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSalesStats } from '@/hooks/useSales';
import { Link } from 'react-router-dom';
import { ArrowRight, IndianRupee, FileText, Loader2 } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
}

export function SalesOverviewWidget() {
  const { data, isLoading } = useSalesStats();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-primary" />
          Sales Overview
        </CardTitle>
        <Link to="/sales">
          <Button variant="ghost" size="sm" className="text-primary">
            Open Portal <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No sales data yet. Upload a monthly sales report to get started.</p>
        ) : (
          <div className="space-y-6">
            {/* KPIs */}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Showing {data.latest_month_label}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(data.this_month.revenue)}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Invoices</p>
                  <p className="text-xl font-bold text-foreground">{data.this_month.invoices}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Top Customer</p>
                  <p className="text-sm font-semibold text-foreground truncate" title={data.this_month.top_customer || ''}>
                    {data.this_month.top_customer || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Trend chart */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Revenue — Last 6 Months</p>
              <div className="h-48">
                {data.trend.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">No trend data available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(v: number) => formatCurrency(v)}
                        contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top products */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Top Products — {data.latest_month_label}</p>
              {data.top_products.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No items sold this month yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.top_products.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-foreground truncate">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">{Number(p.quantity).toFixed(2)}</span>
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(p.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
