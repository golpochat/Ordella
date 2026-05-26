'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  refreshAnalyticsInsights,
  updateAnalyticsInsightSettings,
  type AnalyticsInsightsDashboard,
} from '@/lib/api/admin/analytics-insights';
import { getErrorMessage } from '@/lib/utils';
import { useTenantSettings } from '@/hooks/use-tenant-settings';

type AnalyticsInsightsPanelProps = {
  dashboard: AnalyticsInsightsDashboard;
};

export function AnalyticsInsightsPanel({ dashboard: initialDashboard }: AnalyticsInsightsPanelProps) {
  const { formatCurrency } = useTenantSettings();
  const api = createBrowserApiClient();
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [settings, setSettings] = useState(initialDashboard.settings);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setMessage(null);
    setError(null);
    try {
      await refreshAnalyticsInsights(api);
      setMessage('Analytics snapshots refreshed. Reload the page to view the latest aggregates.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function saveSettings() {
    setMessage(null);
    setError(null);
    try {
      const saved = await updateAnalyticsInsightSettings(api, {
        segmentationRules: settings.segmentationRules,
        ltvParameters: settings.ltvParameters,
        churnThresholds: settings.churnThresholds,
      });
      setSettings(saved);
      setDashboard({ ...dashboard, settings: saved });
      setMessage('Insight settings saved.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Generated {new Date(dashboard.generatedAt).toLocaleString(dashboard.locale, { timeZone: dashboard.timezone })}
        </div>
        <Button type="button" variant="outline" onClick={() => void refresh()}>
          Refresh snapshots
        </Button>
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Customers" value={dashboard.metrics.customers} />
        <Metric label="Average LTV" value={formatCurrency(dashboard.metrics.averageLtv)} />
        <Metric label="Critical churn" value={dashboard.metrics.criticalChurnCustomers} />
        <Metric label="High churn" value={dashboard.metrics.highChurnCustomers} />
        <Metric label="Affinity pairs" value={dashboard.metrics.affinityPairs} />
        <Metric label="Marketing segments" value={dashboard.metrics.marketingSegments} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Product affinity network</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkGraph dashboard={dashboard} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Churn risk funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList rows={dashboard.churn.funnel.map((row) => ({ label: row.band, value: row.count }))} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cohort retention heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <CohortHeatmap dashboard={dashboard} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>LTV distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList rows={dashboard.ltv.distribution.map((row) => ({ label: row.label, value: row.count }))} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segmentation clusters</CardTitle>
        </CardHeader>
        <CardContent>
          <ClusterChart dashboard={dashboard} />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top affinity pairs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Related item</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Lift</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
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
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Predicted LTV</TableHead>
                  <TableHead>Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
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
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function BarList({ rows }: { rows: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className={`h-2 rounded-full bg-primary ${widthClass((row.value / max) * 100)}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function NetworkGraph({ dashboard }: { dashboard: AnalyticsInsightsDashboard }) {
  const edges = dashboard.basketAnalysis.network.edges.slice(0, 16);
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {edges.map((edge) => {
        const source = dashboard.basketAnalysis.network.nodes.find((node) => node.id === edge.source)?.label ?? edge.source;
        const target = dashboard.basketAnalysis.network.nodes.find((node) => node.id === edge.target)?.label ?? edge.target;
        return (
          <div key={`${edge.source}-${edge.target}`} className="rounded-md border p-3 text-sm">
            <p className="font-medium">{source}</p>
            <p className="text-muted-foreground">pairs with {target}</p>
            <p className="text-xs text-primary">Affinity {edge.weight.toFixed(1)}</p>
          </div>
        );
      })}
    </div>
  );
}

function CohortHeatmap({ dashboard }: { dashboard: AnalyticsInsightsDashboard }) {
  return (
    <div className="space-y-2 overflow-x-auto">
      {dashboard.cohorts.heatmap.slice(-8).map((row) => (
        <div key={row.cohort} className="flex min-w-max items-center gap-2">
          <Link className="w-20 text-sm font-medium text-primary hover:underline" href={`/analytics-insights/cohorts/${row.cohort}`}>
            {row.cohort}
          </Link>
          {row.months.slice(0, 8).map((month) => {
            const rate = month.retentionRate ?? 0;
            return (
              <div key={`${row.cohort}-${month.month}`} className={`h-9 w-16 rounded-md border text-center text-xs leading-9 ${heatClass(rate)}`}>
                {rate.toFixed(0)}%
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ClusterChart({ dashboard }: { dashboard: AnalyticsInsightsDashboard }) {
  const points = dashboard.segmentation.clusters.slice(0, 80);
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>More recent customers on the left</span>
        <span>Higher frequency customers appear larger</span>
      </div>
      <div className="grid grid-cols-5 gap-3 md:grid-cols-8 xl:grid-cols-10">
      {points.map((point) => (
        <Link
          key={point.customerId}
          href={`/analytics-insights/customers/${point.customerId}`}
          title={point.customerName}
          className={`rounded-full bg-primary/70 hover:bg-primary ${bubbleClass(point.size)}`}
        />
      ))}
      </div>
    </div>
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

function widthClass(value: number) {
  if (value >= 90) return 'w-full';
  if (value >= 75) return 'w-3/4';
  if (value >= 66) return 'w-2/3';
  if (value >= 50) return 'w-1/2';
  if (value >= 33) return 'w-1/3';
  if (value >= 25) return 'w-1/4';
  if (value >= 16) return 'w-1/6';
  return 'w-8';
}

function heatClass(rate: number) {
  if (rate >= 80) return 'bg-emerald-500/80 text-white';
  if (rate >= 60) return 'bg-emerald-400/70';
  if (rate >= 40) return 'bg-emerald-300/60';
  if (rate >= 20) return 'bg-emerald-200/60';
  return 'bg-muted';
}

function bubbleClass(size: number) {
  if (size >= 24) return 'h-7 w-7';
  if (size >= 18) return 'h-6 w-6';
  if (size >= 12) return 'h-5 w-5';
  return 'h-4 w-4';
}
