import Link from 'next/link';
import type { ReactNode } from 'react';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { formatMoney } from '@/lib/utils';
import { ReportTable } from './report-table';

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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Revenue" value={formatMoney(revenue)} />
        <Metric title="Orders" value={orders.toString()} />
        <Metric title="AOV" value={formatMoney(aov)} />
        <Metric title="Inventory value" value={formatMoney(inventoryValue)} />
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <Metric title="Stockouts" value={String(inventory.stockouts ?? 0)} />
        <Metric title="Overstock" value={String(inventory.overstock ?? 0)} />
        <Metric title="Delivery on-time" value={`${delivery.onTimeRate ?? 0}%`} />
        <Metric title="Supplier on-time" value={`${supplier.averageOnTimeRate ?? 0}%`} />
        <Metric title="Promo revenue" value={formatMoney(String(promotions.influencedRevenue ?? 0))} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
        <LineChart title="Sales trend" rows={dailyRevenue} labelKey="date" valueKey="revenue" />
        <PieChart title="Payment methods" rows={paymentRows} labelKey="paymentMethod" valueKey="orders" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <BarChart title="Category performance" rows={categoryRows} labelKey="categoryName" valueKey="revenue" />
        <Heatmap title="Hourly sales heatmap" rows={hourlyRows} />
      </div>

      <ReportSection title="Product sales drill-down" rows={withProductLinks(itemRows)} columns={['product', 'quantitySold', 'revenue']} />
      <ReportSection title="Location performance" rows={withLocationLinks(arrayValue(sales.revenueByLocation ?? report.revenueByLocation))} columns={['location', 'orders', 'revenue']} />
      <ReportSection title="Inventory health" rows={stockRows.slice(0, 25)} columns={['name', 'categoryName', 'available', 'status', 'reorderLevel', 'safetyStock']} />
      <ReportSection title="Delivery driver metrics" rows={driverRows} columns={['driverName', 'deliveries', 'completed', 'onTimeRate', 'averageMinutes']} />
      <ReportSection title="Supplier performance drill-down" rows={withSupplierLinks(supplierRows)} columns={['supplier', 'purchaseOrders', 'onTimeDeliveryRate', 'averageLeadTimeDays', 'rejectionRate', 'spend']} />
      <ReportSection title="Promotion performance" rows={promotionRows} columns={['promotionName', 'applications', 'conversionRate', 'uplift', 'roi', 'revenue']} />
      <ReportSection title="Sales by channel" rows={arrayValue(sales.salesByChannel ?? report.salesByChannel)} columns={['channel', 'orders', 'revenue']} />
      <ReportSection title="Tax summary" rows={arrayValue(report.lines)} columns={['taxName', 'jurisdiction', 'taxableAmount', 'taxAmount']} />
      {customerMetrics.customerCount ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Metric title="Customers" value={String(customerMetrics.customerCount ?? '0')} />
          <Metric title="Customer LTV" value={formatMoney(String(customerMetrics.lifetimeValue ?? 0))} />
        </div>
      ) : null}
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function LineChart({ title, rows, labelKey, valueKey }: { title: string; rows: Record<string, string | number>[]; labelKey: string; valueKey: string }) {
  const max = Math.max(...rows.map((row) => Number(row[valueKey] ?? 0)), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <div className="flex h-48 items-end gap-2 rounded-lg border bg-muted/20 p-3">
            {rows.slice(-30).map((row) => (
              <div key={String(row[labelKey])} className="flex min-w-6 flex-1 flex-col items-center justify-end gap-2">
                <div className={`w-full rounded-t bg-primary ${heightClass(Number(row[valueKey] ?? 0), max)}`} />
                <span className="max-w-16 truncate text-[10px] text-muted-foreground">{String(row[labelKey]).slice(5)}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">No trend data for this range.</p>}
      </CardContent>
    </Card>
  );
}

function BarChart({ title, rows, labelKey, valueKey }: { title: string; rows: Record<string, string | number>[]; labelKey: string; valueKey: string }) {
  const max = Math.max(...rows.map((row) => Number(row[valueKey] ?? 0)), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.slice(0, 10).map((row) => (
          <div key={String(row[labelKey])} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{String(row[labelKey])}</span>
              <span className="text-muted-foreground">{formatNumberValue(row[valueKey])}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full bg-primary ${widthClass(Number(row[valueKey] ?? 0), max)}`} />
            </div>
          </div>
        ))}
        {!rows.length ? <p className="text-sm text-muted-foreground">No category data for this range.</p> : null}
      </CardContent>
    </Card>
  );
}

function PieChart({ title, rows, labelKey, valueKey }: { title: string; rows: Record<string, string | number>[]; labelKey: string; valueKey: string }) {
  const total = rows.reduce((sum, row) => sum + Number(row[valueKey] ?? 0), 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid place-items-center rounded-full border p-8 text-center">
          <p className="text-2xl font-semibold">{total}</p>
          <p className="text-xs text-muted-foreground">payments</p>
        </div>
        {rows.map((row) => {
          const share = total ? Math.round((Number(row[valueKey] ?? 0) / total) * 100) : 0;
          return (
            <div key={String(row[labelKey])} className="flex items-center justify-between text-sm">
              <span>{String(row[labelKey])}</span>
              <Badge variant="secondary">{share}%</Badge>
            </div>
          );
        })}
        {!rows.length ? <p className="text-sm text-muted-foreground">No payment method data.</p> : null}
      </CardContent>
    </Card>
  );
}

function Heatmap({ title, rows }: { title: string; rows: Record<string, string | number>[] }) {
  const max = Math.max(...rows.map((row) => Number(row.orders ?? 0)), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-2 md:grid-cols-8 lg:grid-cols-12">
          {rows.slice(0, 72).map((row) => (
            <div key={`${row.day}-${row.hour}`} className={`rounded-md p-2 text-center text-xs ${heatClass(Number(row.orders ?? 0), max)}`}>
              <p className="font-medium">{row.day} {row.hour}:00</p>
              <p>{row.orders} orders</p>
            </div>
          ))}
        </div>
        {!rows.length ? <p className="text-sm text-muted-foreground">No hourly sales data.</p> : null}
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ReportTable columns={columns} rows={rows} />
      </CardContent>
    </Card>
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

function widthClass(value: number, max: number) {
  const pct = max ? value / max : 0;
  if (pct >= 0.9) return 'w-full';
  if (pct >= 0.75) return 'w-10/12';
  if (pct >= 0.5) return 'w-8/12';
  if (pct >= 0.25) return 'w-5/12';
  if (pct > 0) return 'w-2/12';
  return 'w-0';
}

function heightClass(value: number, max: number) {
  const pct = max ? value / max : 0;
  if (pct >= 0.9) return 'h-44';
  if (pct >= 0.75) return 'h-36';
  if (pct >= 0.5) return 'h-28';
  if (pct >= 0.25) return 'h-16';
  if (pct > 0) return 'h-8';
  return 'h-1';
}

function heatClass(value: number, max: number) {
  const pct = max ? value / max : 0;
  if (pct >= 0.75) return 'bg-primary text-primary-foreground';
  if (pct >= 0.5) return 'bg-primary/70 text-primary-foreground';
  if (pct >= 0.25) return 'bg-primary/30';
  if (pct > 0) return 'bg-muted';
  return 'bg-muted/40 text-muted-foreground';
}
