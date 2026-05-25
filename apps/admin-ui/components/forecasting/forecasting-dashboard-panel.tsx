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

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <Metric title="Forecast confidence" value={`${Math.round(Number(forecast.confidence ?? 0) * 100)}%`} />
        <Metric title="Forecast units" value={String(demand.totalForecastedUnits ?? 0)} />
        <Metric title="Stockout risk" value={String(inventory.stockoutPredictions ?? 0)} />
        <Metric title="Peak staff need" value={String(staffing.maxRecommendedStaff ?? 0)} />
        <Metric title="Transfer actions" value={String(warehouse.transferRecommendations ?? 0)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Forecast Health</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge>Accuracy {String(accuracy.forecastAccuracy ?? 'n/a')}</Badge>
          <Badge>Stockout prevention {String(accuracy.stockoutPrevention ?? 'n/a')}</Badge>
          <Badge>Staffing risk {String(accuracy.overstaffUnderstaffRisk ?? 'n/a')}</Badge>
          <Badge>Supplier delay {String(accuracy.supplierDelayRisk ?? 'n/a')}</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <ForecastTable title="Demand forecast" rows={arrayRows(forecast.demand, 'itemForecasts')} columns={['productName', 'forecastedDemand', 'lowerBound', 'upperBound']} />
        <ForecastTable title="Stockout predictions" rows={arrayRows(forecast.inventory, 'stockoutPredictions')} columns={['name', 'available', 'daysUntilStockout', 'recommendedReorderQty']} />
        <ForecastTable title="Staffing forecast" rows={arrayRows(forecast.staffing, 'hourlyStaffing')} columns={['hour', 'forecastedOrders', 'recommendedPosStaff', 'recommendedFulfillmentStaff']} />
        <ForecastTable title="Delivery capacity" rows={arrayRows(forecast.deliveryCapacity, 'hourlyDeliveryCapacity')} columns={['hour', 'forecastedDeliveries', 'recommendedDrivers']} />
        <ForecastTable title="Warehouse replenishment" rows={arrayRows(forecast.warehouseReplenishment, 'transferRecommendations')} columns={['name', 'locationId', 'recommendedTransferQty', 'reason']} />
        <ForecastTable title="Replenishment waves" rows={arrayRows(forecast.warehouseReplenishment, 'replenishmentWaves')} columns={['warehouseId', 'forecastedPickTasks']} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Demand Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ForecastSparkline rows={arrayRows(forecast.demand, 'categoryForecasts')} />
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
}: {
  title: string;
  rows: Record<string, unknown>[];
  columns: string[];
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
                  <TableCell key={column}>{String(row[column] ?? '-')}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ForecastSparkline({ rows }: { rows: Record<string, unknown>[] }) {
  const values = rows.slice(0, 8).map((row) => Number(row.forecastedDemand ?? 0));
  const max = Math.max(1, ...values);
  const points = values
    .map((value, index) => {
      const x = 10 + index * 42;
      const y = 110 - (value / max) * 90;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg className="h-32 w-full text-primary" viewBox="0 0 340 120" role="img" aria-label="Category forecast trend">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" />
      {values.map((value, index) => (
        <circle key={index} cx={10 + index * 42} cy={110 - (value / max) * 90} r="4" fill="currentColor" />
      ))}
    </svg>
  );
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function arrayRows(source: unknown, key: string): Record<string, unknown>[] {
  const object = objectValue(source);
  const rows = object[key];
  return Array.isArray(rows) ? rows.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object' && !Array.isArray(row)) : [];
}
