import Link from 'next/link';
import { Badge, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';

type ForecastingDashboardPanelProps = {
  forecast: Record<string, unknown>;
};

export function ForecastingDashboardPanel({ forecast }: ForecastingDashboardPanelProps) {
  const demand = objectValue(forecast.demand);
  const inventory = objectValue(forecast.inventory);
  const staffing = objectValue(forecast.staffing);
  const warehouse = objectValue(forecast.warehouseReplenishment);
  const accuracy = objectValue(forecast.accuracyMetrics);
  const demandTrend = arrayRows(demand, 'demandTrend');
  const categoryForecasts = arrayRows(demand, 'categoryForecasts');
  const itemForecasts = arrayRows(demand, 'itemForecasts');
  const locationForecasts = arrayRows(demand, 'locationForecasts');
  const stockoutPredictions = arrayRows(inventory, 'stockoutPredictions');
  const reorderRecommendations = arrayRows(inventory, 'reorderRecommendations');
  const hourlyStaffing = arrayRows(staffing, 'hourlyStaffing');
  const heatmap = arrayRows(staffing, 'hourlyDemandHeatmap');
  const transferRecommendations = arrayRows(warehouse, 'transferRecommendations');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <Metric title="Forecast confidence" value={`${Math.round(Number(forecast.confidence ?? 0) * 100)}%`} />
        <Metric title="Forecast units" value={String(demand.totalForecastedUnits ?? 0)} />
        <Metric title="Stockout risk" value={String(inventory.stockoutPredictions ?? 0)} />
        <Metric title="Peak staff need" value={String(staffing.maxRecommendedStaff ?? 0)} />
        <Metric title="Transfer actions" value={String(warehouse.transferRecommendations ?? 0)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demand Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart rows={demandTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Forecast Accuracy</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <AccuracyMetric label="MAPE" value={`${String(accuracy.mape ?? 'n/a')}%`} />
            <AccuracyMetric label="Bias" value={`${String(accuracy.bias ?? 'n/a')}%`} />
            <AccuracyMetric label="Stockout prevention" value={String(accuracy.stockoutPrevention ?? 'n/a')} />
            <AccuracyMetric label="Staffing risk" value={String(accuracy.overstaffUnderstaffRisk ?? 'n/a')} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <BarChart title="Category Forecast" rows={categoryForecasts} labelKey="categoryName" valueKey="forecastedDemand" />
        <Heatmap title="Hourly Demand Heatmap" rows={heatmap} />
        <ForecastTable title="Demand by product" rows={itemForecasts} columns={['productName', 'categoryName', 'forecastedDemand', 'lowerBound', 'upperBound']} detailType="product" />
        <ForecastTable title="Demand by location" rows={locationForecasts} columns={['locationId', 'historicalQuantity', 'forecastedDemand']} detailType="location" />
        <ForecastTable title="Inventory stock-out risk" rows={stockoutPredictions} columns={['name', 'available', 'daysUntilStockout', 'nextReorderDate', 'suggestedQuantity']} />
        <ForecastTable title="Staffing forecast" rows={hourlyStaffing} columns={['hour', 'forecastedOrders', 'recommendedPosStaff', 'recommendedFulfillmentStaff']} />
        <ForecastTable title="Replenishment forecast" rows={reorderRecommendations} columns={['name', 'locationId', 'daysUntilStockout', 'nextReorderDate', 'suggestedQuantity']} />
        <ForecastTable title="Warehouse planning" rows={transferRecommendations} columns={['name', 'locationId', 'recommendedTransferQty', 'reason']} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Planning Integrations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge>Replenishment rules: {reorderRecommendations.length} suggested actions</Badge>
          <Badge>Purchase order suggestions: {reorderRecommendations.filter((row) => Number(row.suggestedQuantity ?? 0) > 0).length}</Badge>
          <Badge>Warehouse planning: {transferRecommendations.length} transfer candidates</Badge>
          <Badge>Supplier delay: {String(accuracy.supplierDelayRisk ?? 'n/a')}</Badge>
        </CardContent>
      </Card>
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

function ForecastTable({
  title,
  rows,
  columns,
  detailType,
}: {
  title: string;
  rows: Record<string, unknown>[];
  columns: string[];
  detailType?: 'product' | 'location';
}) {
  if (!rows.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 10).map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column}>
                    {column === 'productName' && detailType === 'product' && row.productId ? (
                      <Link className="font-medium text-primary hover:underline" href={`/forecasting/product/${row.productId}`}>
                        {String(row[column] ?? '-')}
                      </Link>
                    ) : column === 'locationId' && detailType === 'location' && row.locationId ? (
                      <Link className="font-medium text-primary hover:underline" href={`/forecasting/location/${row.locationId}`}>
                        {String(row[column] ?? '-')}
                      </Link>
                    ) : (
                      String(row[column] ?? '-')
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function LineChart({ rows }: { rows: Record<string, unknown>[] }) {
  const values = rows.slice(0, 14).map((row) => Number(row.forecastedDemand ?? 0));
  const lower = rows.slice(0, 14).map((row) => Number(row.lowerBound ?? 0));
  const upper = rows.slice(0, 14).map((row) => Number(row.upperBound ?? 0));
  const max = Math.max(1, ...values);
  const points = values
    .map((value, index) => {
      const x = 10 + index * 24;
      const y = 110 - (value / max) * 90;
      return `${x},${y}`;
    })
    .join(' ');
  const lowerPoints = lower.map((value, index) => `${10 + index * 24},${110 - (value / max) * 90}`).join(' ');
  const upperPoints = upper.map((value, index) => `${10 + index * 24},${110 - (value / max) * 90}`).join(' ');
  return (
    <svg className="h-56 w-full text-primary" viewBox="0 0 340 120" role="img" aria-label="Forecast demand trend">
      <polyline points={upperPoints} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <polyline points={lowerPoints} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" />
      {values.map((value, index) => (
        <circle key={index} cx={10 + index * 24} cy={110 - (value / max) * 90} r="3" fill="currentColor" />
      ))}
    </svg>
  );
}

function BarChart({ title, rows, labelKey, valueKey }: { title: string; rows: Record<string, unknown>[]; labelKey: string; valueKey: string }) {
  const values = rows.slice(0, 8).map((row) => Number(row[valueKey] ?? 0));
  const max = Math.max(1, ...values);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.slice(0, 8).map((row, index) => (
          <div key={index} className="grid grid-cols-[minmax(0,1fr)_3fr_auto] items-center gap-3 text-sm">
            <span className="truncate text-muted-foreground">{String(row[labelKey] ?? '-')}</span>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div className={barWidthClass(Number(row[valueKey] ?? 0), max)} />
            </div>
            <span className="font-medium">{String(row[valueKey] ?? 0)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Heatmap({ title, rows }: { title: string; rows: Record<string, unknown>[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-2 md:grid-cols-12">
          {Array.from({ length: 24 }, (_, hour) => {
            const row = rows.find((entry) => Number(entry.hour) === hour);
            const intensity = Number(row?.intensity ?? 0);
            return (
              <div key={hour} className={`rounded-lg border p-2 text-center text-xs ${heatClass(intensity)}`}>
                <p className="font-medium">{hour}:00</p>
                <p>{String(row?.forecastedOrders ?? 0)}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function AccuracyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function barWidthClass(value: number, max: number): string {
  const ratio = value / Math.max(1, max);
  if (ratio >= 0.9) return 'h-full w-full rounded-full bg-primary';
  if (ratio >= 0.75) return 'h-full w-10/12 rounded-full bg-primary';
  if (ratio >= 0.5) return 'h-full w-8/12 rounded-full bg-primary';
  if (ratio >= 0.25) return 'h-full w-5/12 rounded-full bg-primary';
  return 'h-full w-2/12 rounded-full bg-primary';
}

function heatClass(intensity: number): string {
  if (intensity >= 0.75) return 'bg-primary text-primary-foreground';
  if (intensity >= 0.5) return 'bg-primary/70 text-primary-foreground';
  if (intensity >= 0.25) return 'bg-primary/30';
  return 'bg-muted/40 text-muted-foreground';
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function arrayRows(source: unknown, key: string): Record<string, unknown>[] {
  const object = objectValue(source);
  const rows = object[key];
  return Array.isArray(rows) ? rows.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object' && !Array.isArray(row)) : [];
}
