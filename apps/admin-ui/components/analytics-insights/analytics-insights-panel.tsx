'use client';

import { useAdminToast } from '@/components/ui/admin-toast';
import Link from 'next/link';
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Flex, Input, Stack, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  refreshAnalyticsInsights,
  updateAnalyticsInsightSettings,
  type AnalyticsInsightsDashboard,
} from '@/lib/api/admin/analytics-insights';
import { getErrorMessage } from '@/lib/utils';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Metric, MetricGrid } from '@/components/ui/admin-card';
import {
  AffinityNetworkChart,
  BarListChart,
  ChartGrid,
  ClusterBubbleChart,
  CohortRetentionHeatmap,
} from '@/components/ui/admin-chart';

type AnalyticsInsightsPanelProps = {
  dashboard: AnalyticsInsightsDashboard;
};

export function AnalyticsInsightsPanel({ dashboard: initialDashboard }: AnalyticsInsightsPanelProps) {
  const { success: toastSuccess, error: toastError } = useAdminToast();
  const { formatCurrency } = useTenantSettings();
  const api = createBrowserApiClient();
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [settings, setSettings] = useState(initialDashboard.settings);

  async function refresh() {
    try {
      await refreshAnalyticsInsights(api);
      toastSuccess('Analytics snapshots refreshed. Reload the page to view the latest aggregates.');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function saveSettings() {
    try {
      const saved = await updateAnalyticsInsightSettings(api, {
        segmentationRules: settings.segmentationRules,
        ltvParameters: settings.ltvParameters,
        churnThresholds: settings.churnThresholds,
      });
      setSettings(saved);
      setDashboard({ ...dashboard, settings: saved });
      toastSuccess('Insight settings saved.');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  return (
    <Stack gap="lg">
      <Flex gap="sm" wrap justify="between" align="center">
        <div className="text-sm text-muted-foreground">
          Generated{' '}
          {new Date(dashboard.generatedAt).toLocaleString(dashboard.locale, { timeZone: dashboard.timezone })}
        </div>
        <Button type="button" variant="outline" onClick={() => void refresh()}>
          Refresh snapshots
        </Button>
      </Flex>
      <MetricGrid columns={6}>
        <Metric label="Customers" value={dashboard.metrics.customers} />
        <Metric label="Average LTV" value={formatCurrency(dashboard.metrics.averageLtv)} />
        <Metric label="Critical churn" value={dashboard.metrics.criticalChurnCustomers} />
        <Metric label="High churn" value={dashboard.metrics.highChurnCustomers} />
        <Metric label="Affinity pairs" value={dashboard.metrics.affinityPairs} />
        <Metric label="Marketing segments" value={dashboard.metrics.marketingSegments} />
      </MetricGrid>

      <ChartGrid className="min-[1281px]:grid-cols-[1.1fr_0.9fr]">
        <AffinityNetworkChart
          title="Product affinity network"
          edges={dashboard.basketAnalysis.network.edges.slice(0, 16).map((edge) => {

            const source =
              dashboard.basketAnalysis.network.nodes.find((node) => node.id === edge.source)?.label ?? edge.source;
            const target =
              dashboard.basketAnalysis.network.nodes.find((node) => node.id === edge.target)?.label ?? edge.target;
            return {
              key: `${edge.source}-${edge.target}`,
              sourceLabel: source,
              targetLabel: target,
              weight: edge.weight,
            };
          })}
        />
        <BarListChart
          title="Churn risk funnel"
          items={dashboard.churn.funnel.map((row) => ({ label: row.band, value: row.count }))}
          emptyTitle="No churn funnel data"
          emptyDescription="Risk bands populate after churn scoring runs."
        />
      </ChartGrid>

      <ChartGrid>
        <CohortRetentionHeatmap
          title="Cohort retention heatmap"
          rows={dashboard.cohorts.heatmap.slice(-8).map((row) => ({
            cohort: row.cohort,
            cohortHref: `/analytics-insights/cohorts/${row.cohort}`,
            months: row.months.slice(0, 8).map((month) => ({
              month: String(month.month),
              retentionRate: month.retentionRate ?? 0,
            })),
          }))}
        />
        <BarListChart
          title="LTV distribution"
          items={dashboard.ltv.distribution.map((row) => ({ label: row.label, value: row.count }))}
          emptyTitle="No LTV distribution"
          emptyDescription="Lifetime value buckets appear once LTV is calculated."
        />
      </ChartGrid>

      <ClusterBubbleChart
        title="Segmentation clusters"
        points={dashboard.segmentation.clusters.slice(0, 80).map((point) => ({
          customerId: point.customerId,
          customerHref: `/analytics-insights/customers/${point.customerId}`,
          customerName: point.customerName,
          size: point.size,
        }))}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top affinity pairs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Related item</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Lift</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {dashboard.basketAnalysis.affinities.slice(0, 12).map((row) => (
                  <TableRow key={`${row.productId}-${row.relatedProductId}`}>
                    <TableCell>
                      <Link className="text-primary hover:underline" href={`/analytics-insights/products/${row.productId}`}>
                        {row.productName}
                      </Link>
                    </TableCell>
                    <TableCell>{row.relatedProductName}</TableCell>
                    <TableCell>{row.affinityScore.toFixed(1)}</TableCell>
                    <TableCell>{row.lift.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>At-risk customers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Predicted LTV</TableHead>
                  <TableHead>Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {dashboard.churn.atRiskCustomers.map((row) => (
                  <TableRow key={row.customerId}>
                    <TableCell>
                      <Link className="text-primary hover:underline" href={`/analytics-insights/customers/${row.customerId}`}>
                        {row.name}
                      </Link>
                    </TableCell>
                    <TableCell>{row.churnBand} ({row.churnRisk.toFixed(0)})</TableCell>
                    <TableCell>{formatCurrency(row.predictedLtv)}</TableCell>
                    <TableCell>{row.totalOrders}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Segmentation and marketing audiences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.segmentation.segments.map((segment) => (
              <div key={segment.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{segment.name}</p>
                  <span className="text-sm text-muted-foreground">{segment.customerCount} customers</span>
                </div>
                <p className="text-xs text-muted-foreground">Rules: {JSON.stringify(segment.rules)}</p>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">
              Marketing integration: {dashboard.segmentation.marketingAudiences.length} campaign audience(s) available.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insight settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SettingInput
              label="High value percentile"
              value={Number(settings.segmentationRules.highValuePercentile ?? 0.8)}
              onChange={(value) => setSettings({
                ...settings,
                segmentationRules: { ...settings.segmentationRules, highValuePercentile: value },
              })}
            />
            <SettingInput
              label="Frequent buyer orders"
              value={Number(settings.segmentationRules.frequentBuyerOrders ?? 4)}
              onChange={(value) => setSettings({
                ...settings,
                segmentationRules: { ...settings.segmentationRules, frequentBuyerOrders: value },
              })}
            />
            <SettingInput
              label="LTV prediction months"
              value={Number(settings.ltvParameters.predictionMonths ?? 6)}
              onChange={(value) => setSettings({
                ...settings,
                ltvParameters: { ...settings.ltvParameters, predictionMonths: value },
              })}
            />
            <SettingInput
              label="Critical churn threshold"
              value={Number(settings.churnThresholds.critical ?? 85)}
              onChange={(value) => setSettings({
                ...settings,
                churnThresholds: { ...settings.churnThresholds, critical: value },
              })}
            />
            <Button type="button" onClick={() => void saveSettings()}>
              Save analytics settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </Stack>
  );
}


function SettingInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <Input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
