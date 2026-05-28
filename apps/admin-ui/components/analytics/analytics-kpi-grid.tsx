import type { AnalyticsOverview } from '@/lib/api/admin/analytics';
import { Metric, MetricGrid } from '@/components/ui/admin-card';
import { formatMoney } from '@/lib/utils';

type AnalyticsKpiGridProps = {
  overview: AnalyticsOverview;
};

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
    <MetricGrid columns={3} className="min-[1025px]:grid-cols-3">
      <Metric title="Total sales" value={formatMoney(overview.salesTotal)} />
      <Metric title="Total orders" value={overview.ordersTotal.toLocaleString()} />
      <Metric title="Average order value" value={formatMoney(overview.avgOrderValue)} />
      <Metric title="Growth" value={growth} description="vs previous period" />
      <Metric title="Fulfillment time (avg)" value={fulfillment} />
      <Metric title="Delivery time (avg)" value={delivery} />
    </MetricGrid>
  );
}
