import { Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { formatMoney } from '@/lib/utils';
import { ReportTable } from './report-table';

type EnterpriseReportsPanelProps = {
  report: Record<string, unknown>;
};

export function EnterpriseReportsPanel({ report }: EnterpriseReportsPanelProps) {
  const revenue = String(report.revenue ?? report.totalRevenue ?? '0');
  const orders = Number(report.orders ?? report.orderCount ?? 0);
  const aov = String(report.averageOrderValue ?? '0');
  const taxCollected = String(report.taxCollected ?? '0');
  const inventoryValue = String(report.inventoryValue ?? '0');
  const customerMetrics = objectValue(report.customerMetrics);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Revenue" value={formatMoney(revenue)} />
        <Metric title="Orders" value={orders.toString()} />
        <Metric title="AOV" value={formatMoney(aov)} />
        <Metric title="Tax collected" value={formatMoney(taxCollected)} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="Inventory value" value={formatMoney(inventoryValue)} />
        <Metric title="Customers" value={String(customerMetrics.customerCount ?? '0')} />
        <Metric title="Customer LTV" value={formatMoney(String(customerMetrics.lifetimeValue ?? 0))} />
      </div>
      <ReportSection title="Revenue by location" rows={arrayValue(report.revenueByLocation)} columns={['locationName', 'orders', 'revenue']} />
      <ReportSection title="Sales by channel" rows={arrayValue(report.salesByChannel)} columns={['channel', 'orders', 'revenue']} />
      <ReportSection title="Top categories" rows={arrayValue(report.topCategories ?? report.revenueByCategory)} columns={['categoryName', 'quantitySold', 'revenue']} />
      <ReportSection title="Top items" rows={arrayValue(report.topItems ?? report.revenueByItem)} columns={['productName', 'quantitySold', 'revenue']} />
      <ReportSection title="Daily trend" rows={arrayValue(report.dailyRevenue)} columns={['date', 'orders', 'revenue']} />
      <ReportSection title="Tax summary" rows={arrayValue(report.lines)} columns={['taxName', 'jurisdiction', 'taxableAmount', 'taxAmount']} />
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

function ReportSection({
  title,
  rows,
  columns,
}: {
  title: string;
  rows: Record<string, string | number>[];
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

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
