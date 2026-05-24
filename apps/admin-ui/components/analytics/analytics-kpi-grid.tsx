import { Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import type { AnalyticsOverview } from '@/lib/api/admin/analytics';
import { formatMoney } from '@/lib/utils';

type AnalyticsKpiGridProps = {
  overview: AnalyticsOverview;
};

function KpiCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function AnalyticsKpiGrid({ overview }: AnalyticsKpiGridProps) {
  const growth =
    overview.growthPercent === null
      ? '—'
      : `${overview.growthPercent > 0 ? '+' : ''}${overview.growthPercent}%`;

  const fulfillment =
    overview.fulfillmentTimeAvgMinutes !== null
      ? `${overview.fulfillmentTimeAvgMinutes} min`
      : '—';

  const delivery =
    overview.deliveryEnabled && overview.deliveryTimeAvgMinutes !== null
      ? `${overview.deliveryTimeAvgMinutes} min`
      : overview.deliveryEnabled
        ? '—'
        : 'Not enabled';

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <KpiCard title="Total sales" value={formatMoney(overview.salesTotal)} />
      <KpiCard title="Total orders" value={overview.ordersTotal.toLocaleString()} />
      <KpiCard title="Average order value" value={formatMoney(overview.avgOrderValue)} />
      <KpiCard title="Growth" value={growth} hint="vs previous period" />
      <KpiCard title="Fulfillment time (avg)" value={fulfillment} />
      <KpiCard title="Delivery time (avg)" value={delivery} />
    </div>
  );
}
