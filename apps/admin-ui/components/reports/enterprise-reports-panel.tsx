import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card, CardContent, Grid, PageSection, Stack } from '@shared-ui';
import { formatMoney } from '@/lib/utils';
import { ReportTable } from './report-table';
import { Metric, MetricGrid } from '@/components/ui/admin-card';
import {
  ChartGrid,
  ColumnChart,
  DonutSummaryChart,
  HeatmapChart,
  HorizontalBarChart,
} from '@/components/ui/admin-chart';

type EnterpriseReportsPanelProps = {
  report: Record<string, unknown>;
};

export function EnterpriseReportsPanel({ report }: EnterpriseReportsPanelProps) {
  const sales = objectValue(report.sales);
  const inventory = objectValue(report.inventory);
  const delivery = objectValue(report.delivery);
  const supplier = objectValue(report.supplier);
  const promotions = objectValue(report.promotions);
  const revenue = String(sales.totalRevenue ?? report.revenue ?? report.totalRevenue ?? '0');
  const orders = Number(sales.orderCount ?? report.orders ?? report.orderCount ?? 0);
  const aov = String(sales.averageOrderValue ?? report.averageOrderValue ?? '0');
  const inventoryValue = String(inventory.inventoryValue ?? report.inventoryValue ?? '0');
  const customerMetrics = objectValue(report.customerMetrics);
  const dailyRevenue = arrayValue(sales.dailyRevenue ?? report.dailyRevenue);
  const categoryRows = arrayValue(sales.revenueByCategory ?? report.topCategories ?? report.revenueByCategory);
  const itemRows = arrayValue(sales.revenueByItem ?? report.topItems ?? report.revenueByItem);
  const paymentRows = arrayValue(sales.paymentMethods);
  const hourlyRows = arrayValue(sales.hourlySalesHeatmap);
  const stockRows = arrayValue(inventory.stockLevels);
  const driverRows = arrayValue(delivery.driverMetrics);
  const supplierRows = arrayValue(supplier.suppliers);
  const promotionRows = arrayValue(promotions.promotions);

  return (
    <Stack gap="lg">
      <MetricGrid columns={4}>
        <Metric title="Revenue" value={formatMoney(revenue)} />
        <Metric title="Orders" value={orders.toString()} />
        <Metric title="AOV" value={formatMoney(aov)} />
        <Metric title="Inventory value" value={formatMoney(inventoryValue)} />
      </MetricGrid>
      <MetricGrid columns={5}>
        <Metric title="Stockouts" value={String(inventory.stockouts ?? 0)} />
        <Metric title="Overstock" value={String(inventory.overstock ?? 0)} />
        <Metric title="Delivery on-time" value={`${delivery.onTimeRate ?? 0}%`} />
        <Metric title="Supplier on-time" value={`${supplier.averageOnTimeRate ?? 0}%`} />
        <Metric title="Promo revenue" value={formatMoney(String(promotions.influencedRevenue ?? 0))} />
      </MetricGrid>

      <Grid cols={1} gap="md" className="min-[1281px]:grid-cols-[1.4fr_0.6fr]">
        <ColumnChart
          title="Sales trend"
          points={dailyRevenue.map((row) => ({
            label: String(row.date),
            value: Number(row.revenue ?? 0),
          }))}
          emptyTitle="No sales trend for this range"
          emptyDescription="Daily revenue appears once orders are recorded in the selected period."
        />
        <DonutSummaryChart
          title="Payment methods"
          items={paymentRows.map((row) => ({
            label: String(row.paymentMethod),
            value: Number(row.orders ?? 0),
          }))}
          centerCaption="orders"
          emptyTitle="No payment method data"
          emptyDescription="Payment splits appear when checkout data is available."
        />
      </Grid>

      <ChartGrid>
        <HorizontalBarChart
          title="Category performance"
          items={categoryRows.slice(0, 10).map((row) => ({
            label: String(row.categoryName),
            value: Number(row.revenue ?? 0),
            displayValue: formatNumberValue(row.revenue),
          }))}
          maxItems={10}
          emptyTitle="No category data for this range"
          emptyDescription="Top categories rank by revenue for the selected filters."
        />
        <HeatmapChart
          title="Hourly sales heatmap"
          cells={hourlyRows.slice(0, 72).map((row) => ({
            key: `${row.day}-${row.hour}`,
            label: (
              <>
                {row.day} {row.hour}:00
              </>
            ),
            value: Number(row.orders ?? 0),
            caption: <>{row.orders} orders</>,
          }))}
          emptyTitle="No hourly sales data"
          emptyDescription="Heatmap cells fill in when order timestamps are aggregated by hour."
        />
      </ChartGrid>

      <ReportSection title="Product sales drill-down" rows={withProductLinks(itemRows)} columns={['product', 'quantitySold', 'revenue']} />
      <ReportSection title="Location performance" rows={withLocationLinks(arrayValue(sales.revenueByLocation ?? report.revenueByLocation))} columns={['location', 'orders', 'revenue']} />
      <ReportSection title="Inventory health" rows={stockRows.slice(0, 25)} columns={['name', 'categoryName', 'available', 'status', 'reorderLevel', 'safetyStock']} />
      <ReportSection title="Delivery driver metrics" rows={driverRows} columns={['driverName', 'deliveries', 'completed', 'onTimeRate', 'averageMinutes']} />
      <ReportSection title="Supplier performance drill-down" rows={withSupplierLinks(supplierRows)} columns={['supplier', 'purchaseOrders', 'onTimeDeliveryRate', 'averageLeadTimeDays', 'rejectionRate', 'spend']} />
      <ReportSection title="Promotion performance" rows={promotionRows} columns={['promotionName', 'applications', 'conversionRate', 'uplift', 'roi', 'revenue']} />
      <ReportSection title="Sales by channel" rows={arrayValue(sales.salesByChannel ?? report.salesByChannel)} columns={['channel', 'orders', 'revenue']} />
      <ReportSection title="Tax summary" rows={arrayValue(report.lines)} columns={['taxName', 'jurisdiction', 'taxableAmount', 'taxAmount']} />
      {customerMetrics.customerCount ? (
        <MetricGrid columns={2}>
          <Metric title="Customers" value={String(customerMetrics.customerCount ?? '0')} />
          <Metric title="Customer LTV" value={formatMoney(String(customerMetrics.lifetimeValue ?? 0))} />
        </MetricGrid>
      ) : null}
    </Stack>
  );
}

function ReportSection({
  title,
  rows,
  columns,
}: {
  title: string;
  rows: Record<string, string | number | ReactNode>[];
  columns: string[];
}) {
  if (!rows.length) return null;
  return (
    <PageSection title={title}>
      <Card>
        <CardContent>
          <ReportTable columns={columns} rows={rows} />
        </CardContent>
      </Card>
    </PageSection>
  );
}

function arrayValue(value: unknown): Record<string, string | number>[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    .map((item) => {
      const row: Record<string, string | number> = {};
      for (const [key, nested] of Object.entries(item)) {
        if (typeof nested === 'number' || typeof nested === 'string') row[key] = nested;
      }
      return row;
    });
}

function withProductLinks(rows: Record<string, string | number>[]) {
  return rows.map((row) => ({
    ...row,
    product: row.productId ? <Link className="font-medium text-primary underline-offset-4 hover:underline" href={`/reports/product/${row.productId}`}>{row.productName ?? row.productId}</Link> : row.productName ?? 'Item',
  }));
}

function withLocationLinks(rows: Record<string, string | number>[]) {
  return rows.map((row) => ({
    ...row,
    location: row.locationId ? <Link className="font-medium text-primary underline-offset-4 hover:underline" href={`/reports/location/${row.locationId}`}>{row.locationName ?? row.locationId}</Link> : row.locationName ?? 'Location',
  }));
}

function withSupplierLinks(rows: Record<string, string | number>[]) {
  return rows.map((row) => ({
    ...row,
    supplier: row.supplierId ? <Link className="font-medium text-primary underline-offset-4 hover:underline" href={`/reports/supplier/${row.supplierId}`}>{row.supplierName ?? row.supplierId}</Link> : row.supplierName ?? 'Supplier',
  }));
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function formatNumberValue(value: string | number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  return numeric >= 1000 ? numeric.toLocaleString() : String(numeric);
}
