import Link from 'next/link';
import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import {
  defaultAnalyticsRange,
  getAnalyticsLocations,
  getAnalyticsOverview,
  getCategoryPerformance,
  getLowInventory,
  getOrdersByDay,
  getRecentOrders,
  getRevenueByDay,
  getSalesByChannel,
  getSalesByLocation,
  getTopItems,
} from '@/lib/api/admin/analytics';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { ReportTable } from '@/components/reports/report-table';
import { AnalyticsBarChart } from '@/components/analytics/analytics-bar-chart';
import { AnalyticsFilters } from '@/components/analytics/analytics-filters';
import { AnalyticsKpiGrid } from '@/components/analytics/analytics-kpi-grid';
import { formatDate, formatMoney, getErrorMessage } from '@/lib/utils';
import { PanelEmpty } from '@/components/ui/admin-empty-state';
import { Stack } from '@shared-ui';

type AnalyticsDashboardPanelProps = {
  searchParams: { from?: string; to?: string; locationId?: string };
};

export async function AnalyticsDashboardPanel({ searchParams }: AnalyticsDashboardPanelProps) {
  const defaults = defaultAnalyticsRange();
  const params = {
    from: searchParams.from ?? defaults.from,
    to: searchParams.to ?? defaults.to,
    ...(searchParams.locationId ? { locationId: searchParams.locationId } : {}),
  };

  const api = createServerApiClient();

  try {
    const [
      locations,
      overview,
      revenueByDay,
      ordersByDay,
      salesByChannel,
      salesByLocation,
      topItems,
      categoryPerformance,
      lowInventory,
      recentOrders,
    ] = await Promise.all([
      getAnalyticsLocations(api),
      getAnalyticsOverview(api, params),
      getRevenueByDay(api, params),
      getOrdersByDay(api, params),
      getSalesByChannel(api, params),
      getSalesByLocation(api, params),
      getTopItems(api, params),
      getCategoryPerformance(api, params),
      getLowInventory(api, params),
      getRecentOrders(api, params),
    ]);

    return (
    <Stack gap="lg" className="min-w-0">
        <Suspense fallback={null}>
          <AnalyticsFilters locations={locations} />
        </Suspense>

        <AnalyticsKpiGrid overview={overview} />

        <div className="grid gap-4 lg:grid-cols-2">
          <AnalyticsBarChart
            title="Business sales by day"
            items={revenueByDay.map((row) => ({
              label: row.date,
              value: Number.parseFloat(row.revenue),
              displayValue: formatMoney(row.revenue),
            }))}
          />
          <AnalyticsBarChart
            title="Orders by day"
            items={ordersByDay.map((row) => ({
              label: row.date,
              value: row.orders,
            }))}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AnalyticsBarChart
            title="Sales by channel"
            items={salesByChannel.map((row) => ({
              label: row.label,
              value: Number.parseFloat(row.revenue),
              displayValue: formatMoney(row.revenue),
            }))}
          />
          {locations.length > 1 ? (
            <AnalyticsBarChart
              title="Sales by location"
              items={salesByLocation.map((row) => ({
                label: row.locationName,
                value: Number.parseFloat(row.revenue),
                displayValue: formatMoney(row.revenue),
              }))}
            />
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AnalyticsBarChart
            title="Top selling items"
            items={topItems.map((row) => ({
              label: row.productName,
              value: row.quantitySold,
              displayValue: `${row.quantitySold} sold · ${formatMoney(row.revenue)}`,
            }))}
            emptyMessage="No items sold in this period."
          />
          <AnalyticsBarChart
            title="Catalog performance by category"
            items={categoryPerformance.map((row) => ({
              label: row.categoryName,
              value: Number.parseFloat(row.revenue),
              displayValue: formatMoney(row.revenue),
            }))}
            emptyMessage="No catalog category data for this period."
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold">Recent orders</h3>
            {recentOrders.length === 0 ? (
              <PanelEmpty title="No orders yet" description="Content will appear here when available." />
            ) : (
              <ReportTable
                columns={['order', 'channel', 'status', 'total', 'when']}
                rows={recentOrders.map((order) => ({
                  order: (
                    <Link className="text-primary hover:underline" href={`/orders/${order.id}`}>
                      {order.orderNumber ? `#${order.orderNumber}` : order.id.slice(0, 8)}
                    </Link>
                  ),
                  channel: order.channelLabel,
                  status: order.status,
                  total: formatMoney(order.total),
                  when: formatDate(order.createdAt),
                }))}
              />
            )}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Low inventory items</h3>
            {lowInventory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Stock levels look healthy.</p>
            ) : (
              <ReportTable
                columns={['item', 'sku', 'on hand', 'status']}
                rows={lowInventory.map((item) => ({
                  item: item.name,
                  sku: item.sku,
                  'on hand': item.quantityOnHand,
                  status: item.status === 'out_of_stock' ? 'Out of stock' : 'Low stock',
                }))}
              />
            )}
          </div>
        </div>
      </Stack>
    );
  } catch (err) {
    return <ApiErrorBanner message={getErrorMessage(err)} />;
  }
}
