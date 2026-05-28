import { Tag, TagLabel } from '@/components/ui/admin-tag';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { Stack } from '@shared-ui';
import { Metric, MetricGrid, StatTile } from '@/components/ui/admin-card';
import {
  ChartGrid,
  HeatmapChart,
  HorizontalBarChart,
  LineChart,
} from '@/components/ui/admin-chart';

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

  const trendValues = demandTrend.slice(0, 14).map((row) => Number(row.forecastedDemand ?? 0));
  const lowerValues = demandTrend.slice(0, 14).map((row) => Number(row.lowerBound ?? 0));
  const upperValues = demandTrend.slice(0, 14).map((row) => Number(row.upperBound ?? 0));

  return (
    <Stack gap="lg">
      <MetricGrid columns={5}>
        <Metric title="Forecast confidence" value={`${Math.round(Number(forecast.confidence ?? 0) * 100)}%`} />
        <Metric title="Forecast units" value={String(demand.totalForecastedUnits ?? 0)} />
        <Metric title="Stockout risk" value={String(inventory.stockoutPredictions ?? 0)} />
        <Metric title="Peak staff need" value={String(staffing.maxRecommendedStaff ?? 0)} />
        <Metric title="Transfer actions" value={String(warehouse.transferRecommendations ?? 0)} />
      </MetricGrid>

      <ChartGrid columns={2} className="min-[1025px]:grid-cols-[2fr_1fr]">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Demand trend</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <LineChart
              embedded
              ariaLabel="Forecast demand trend with confidence band"
              series={[
                { values: upperValues, strokeOpacity: 0.25, strokeWidth: 2 },
                { values: lowerValues, strokeOpacity: 0.25, strokeWidth: 2 },
                { values: trendValues, strokeWidth: 3 },
              ]}
              emptyTitle="No demand forecast"
              emptyDescription="Trend lines appear once historical demand is ingested."
            />
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Forecast accuracy</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 pt-0 sm:grid-cols-2 lg:grid-cols-1">
            <StatTile label="MAPE" value={`${String(accuracy.mape ?? 'n/a')}%`} />
            <StatTile label="Bias" value={`${String(accuracy.bias ?? 'n/a')}%`} />
            <StatTile label="Stockout prevention" value={String(accuracy.stockoutPrevention ?? 'n/a')} />
            <StatTile label="Staffing risk" value={String(accuracy.overstaffUnderstaffRisk ?? 'n/a')} />
          </CardContent>
        </Card>
      </ChartGrid>

      <ChartGrid>
        <HorizontalBarChart
          title="Category forecast"
          items={categoryForecasts.slice(0, 8).map((row) => ({
            label: String(row.categoryName ?? '-'),
            value: Number(row.forecastedDemand ?? 0),
          }))}
          maxItems={8}
          emptyTitle="No category forecast"
          emptyDescription="Category-level demand projections appear after the model runs."
        />
        <HeatmapChart
          title="Hourly demand heatmap"
          cells={Array.from({ length: 24 }, (_, hour) => {
            const row = heatmap.find((entry) => Number(entry.hour) === hour);
            const intensity = Number(row?.intensity ?? 0);
            return {
              key: String(hour),
              label: <>{hour}:00</>,
              value: intensity,
              caption: <>{String(row?.forecastedOrders ?? 0)}</>,
            };
          })}
          columnsClassName="grid-cols-6 md:grid-cols-12"
          emptyTitle="No hourly demand pattern"
          emptyDescription="Hourly intensity fills in from staffing demand signals."
        />
        <ForecastTable title="Demand by product" rows={itemForecasts} columns={['productName', 'categoryName', 'forecastedDemand', 'lowerBound', 'upperBound']} detailType="product" />
        <ForecastTable title="Demand by location" rows={locationForecasts} columns={['locationId', 'historicalQuantity', 'forecastedDemand']} detailType="location" />
        <ForecastTable title="Inventory stock-out risk" rows={stockoutPredictions} columns={['name', 'available', 'daysUntilStockout', 'nextReorderDate', 'suggestedQuantity']} />
        <ForecastTable title="Staffing forecast" rows={hourlyStaffing} columns={['hour', 'forecastedOrders', 'recommendedPosStaff', 'recommendedFulfillmentStaff']} />
        <ForecastTable title="Replenishment forecast" rows={reorderRecommendations} columns={['name', 'locationId', 'daysUntilStockout', 'nextReorderDate', 'suggestedQuantity']} />
        <ForecastTable title="Warehouse planning" rows={transferRecommendations} columns={['name', 'locationId', 'recommendedTransferQty', 'reason']} />
      </ChartGrid>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Planning integrations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 pt-0">
          <Tag><TagLabel>Replenishment rules: {reorderRecommendations.length} suggested actions</TagLabel></Tag>
          <Tag><TagLabel>Purchase order suggestions: {reorderRecommendations.filter((row) => Number(row.suggestedQuantity ?? 0) > 0).length}</TagLabel></Tag>
          <Tag><TagLabel>Warehouse planning: {transferRecommendations.length} transfer candidates</TagLabel></Tag>
          <Tag><TagLabel>Supplier delay: {String(accuracy.supplierDelayRisk ?? 'n/a')}</TagLabel></Tag>
        </CardContent>
      </Card>
    </Stack>
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
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader sticky>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody zebra>
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

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function arrayRows(source: unknown, key: string): Record<string, unknown>[] {
  const object = objectValue(source);
  const rows = object[key];
  return Array.isArray(rows) ? rows.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object' && !Array.isArray(row)) : [];
}
