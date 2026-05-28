'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle , Stack } from '@shared-ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/admin-table';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  compareScenarios,
  getDigitalTwin,
  runSimulation,
  saveScenario,
  type DigitalTwin,
  type DigitalTwinsDashboard,
  type ScenarioParameters,
  type SimulationResult,
  type TwinDetail,
} from '@/lib/api/admin/digital-twins';
import { getErrorMessage } from '@/lib/utils';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';
import { ChartHeader, ColumnChart } from '@/components/ui/admin-chart';

const DEFAULT_PARAMS: ScenarioParameters = {
  priceIndex: 1,
  staffingLevel: 1,
  inventoryLevel: 1,
  promoIntensity: 0,
  seasonality: 0,
  weatherImpact: 0,
  supplyChainDelayDays: 0,
};

type DigitalTwinsPanelProps = {
  dashboard: DigitalTwinsDashboard | null;
  twins: DigitalTwin[];
  initialDetail: TwinDetail | null;
};

export function DigitalTwinsPanel({ dashboard, twins, initialDetail }: DigitalTwinsPanelProps) {
  const { success: toastSuccess, error: toastError } = useAdminToast();
  const api = useMemo(() => createBrowserApiClient(), []);
  const [selectedTwinId, setSelectedTwinId] = useState(initialDetail?.twin.id ?? twins[0]?.id ?? '');
  const [detail, setDetail] = useState<TwinDetail | null>(initialDetail);
  const [params, setParams] = useState<ScenarioParameters>(DEFAULT_PARAMS);
  const [scenarioName, setScenarioName] = useState('Custom scenario');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [compareRows, setCompareRows] = useState<Array<{ scenarioId: string; baselineDeltas: Record<string, number> }>>([]);
    async function loadTwin(id: string) {
    try {
      const next = await getDigitalTwin(api, id);
      setDetail(next);
      setSelectedTwinId(id);
      const baseline = next.scenarios.find((s) => s.isBaseline);
      if (baseline?.parameters) {
        setParams({ ...DEFAULT_PARAMS, ...(baseline.parameters as ScenarioParameters) });
      }
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function handleSimulate() {
    if (!selectedTwinId) return;
    try {
      const res = await runSimulation(api, selectedTwinId, { parameters: params, simulationDomain: 'full' });
      setResult(res.result);
      toastSuccess(res.fromCache ? 'Loaded cached simulation result.' : 'Simulation completed (sandbox).');
      await loadTwin(selectedTwinId);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function handleSaveScenario() {
    if (!selectedTwinId) return;
    try {
      await saveScenario(api, selectedTwinId, {
        name: scenarioName,
        parameters: params,
        extremeConditions: { weatherImpact: params.weatherImpact, supplyChainDelayDays: params.supplyChainDelayDays },
      });
      toastSuccess(`Scenario "${scenarioName}" saved.`);
      await loadTwin(selectedTwinId);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function handleCompare() {
    if (!selectedTwinId || !detail) return;
    try {
      const ids = detail.scenarios.slice(0, 3).map((s) => s.id);
      const comparison = await compareScenarios(api, selectedTwinId, ids);
      const rows = (comparison.comparisons as Array<{ scenarioId: string; baselineDeltas: Record<string, number> }>) ?? [];
      setCompareRows(rows);
      toastSuccess(`Compared ${rows.length} scenarios side-by-side.`);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <MetricGrid columns={4}>
        <Metric title="Digital twins" value={dashboard?.twinCount ?? twins.length} />
        <Metric title="Scenarios" value={dashboard?.scenarioCount ?? detail?.scenarios.length ?? 0} />
        <Metric title="Simulation runs" value={dashboard?.runCount ?? 0} />
        <Metric title="Cached results" value={dashboard?.cachedResults ?? 0} />
      </MetricGrid>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Scenario builder</CardTitle>
          <Select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={selectedTwinId}
            onChange={(e) => void loadTwin(e.target.value)}
          >
            {twins.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.twinType})</option>
            ))}
          </Select>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Slider label="Price index" min={0.7} max={1.3} step={0.01} value={params.priceIndex} onChange={(v) => setParams((p) => ({ ...p, priceIndex: v }))} />
            <Slider label="Staffing level" min={0.5} max={1.5} step={0.01} value={params.staffingLevel} onChange={(v) => setParams((p) => ({ ...p, staffingLevel: v }))} />
            <Slider label="Inventory level" min={0.5} max={1.5} step={0.01} value={params.inventoryLevel} onChange={(v) => setParams((p) => ({ ...p, inventoryLevel: v }))} />
            <Slider label="Promo intensity" min={0} max={1} step={0.01} value={params.promoIntensity} onChange={(v) => setParams((p) => ({ ...p, promoIntensity: v }))} />
            <Slider label="Seasonality" min={-1} max={1} step={0.01} value={params.seasonality} onChange={(v) => setParams((p) => ({ ...p, seasonality: v }))} />
            <Slider label="Weather impact" min={0} max={1} step={0.01} value={params.weatherImpact} onChange={(v) => setParams((p) => ({ ...p, weatherImpact: v }))} />
            <Slider label="Supply chain delay (days)" min={0} max={14} step={1} value={params.supplyChainDelayDays} onChange={(v) => setParams((p) => ({ ...p, supplyChainDelayDays: v }))} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void handleSimulate()}>Run simulation</Button>
              <Button type="button" variant="outline" onClick={() => void handleSaveScenario()}>Save scenario</Button>
              <Button type="button" variant="outline" onClick={() => void handleCompare()}>Compare scenarios</Button>
            </div>
            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">Scenario name</span>
              <input className="w-full rounded-md border bg-background px-3 py-2" value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} />
            </label>
          </div>

          <div className="space-y-4">
            {result ? (
              <>
                <KpiGrid kpis={result.kpis} deltas={result.baselineDeltas} />
                <ChartBlock title="Revenue" chart={result.charts.find((c) => c.key === 'revenue')} />
                <ChartBlock title="Margin" chart={result.charts.find((c) => c.key === 'margin')} />
                <ChartBlock title="Stockouts %" chart={result.charts.find((c) => c.key === 'stockouts')} />
                <ChartBlock title="Labor cost" chart={result.charts.find((c) => c.key === 'labor')} />
                <ChartBlock title="Delivery time" chart={result.charts.find((c) => c.key === 'delivery')} />
                {result.aiExplanation ? <p className="text-sm text-muted-foreground">{result.aiExplanation}</p> : null}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Risk analysis</p>
                  {result.riskAnalysis.map((risk, i) => (
                    <Tag key={i} variant="neutral"><TagLabel>{String(risk.level)} · {String(risk.message)}</TagLabel></Tag>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Adjust sliders and run a sandbox simulation. Production data is never modified.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {compareRows.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Scenario comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Scenario</TableHead>
                  <TableHead>Revenue Δ</TableHead>
                  <TableHead>Margin Δ</TableHead>
                  <TableHead>Stockouts Δ</TableHead>
                  <TableHead>Labor Δ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {compareRows.map((row) => (
                  <TableRow key={row.scenarioId}>
                    <TableCell className="font-mono text-xs">{row.scenarioId.slice(0, 8)}…</TableCell>
                    <TableCell>{formatDelta(row.baselineDeltas.revenue)}</TableCell>
                    <TableCell>{formatDelta(row.baselineDeltas.margin)}</TableCell>
                    <TableCell>{formatDelta(row.baselineDeltas.stockoutRate)}</TableCell>
                    <TableCell>{formatDelta(row.baselineDeltas.laborCost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}


function Slider({ label, min, max, step, value, onChange }: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block space-y-1 text-sm">
      <div className="flex justify-between text-muted-foreground">
        <span>{label}</span>
        <span>{value.toFixed(2)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}

function KpiGrid({ kpis, deltas }: { kpis: Record<string, number>; deltas: Record<string, number> }) {
  const keys = ['revenue', 'margin', 'stockoutRate', 'laborCost', 'avgDeliveryMinutes', 'churnRisk'];
  return (
    <div className="grid grid-cols-2 gap-2">
      {keys.filter((k) => kpis[k] !== undefined).map((key) => (
        <div key={key} className="rounded-md border p-2 text-sm">
          <p className="text-muted-foreground">{key}</p>
          <p className="font-semibold">{kpis[key]?.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{formatDelta(deltas[key])}</p>
        </div>
      ))}
    </div>
  );
}

function ChartBlock({ title, chart }: { title: string; chart?: { label: string; series: Array<{ x: string; y: number }> } }) {
  if (!chart?.series.length) return null;
  return (
    <div>
      <ChartHeader title={title} className="mb-2" />
      <ColumnChart
        embedded
        minHeight="sm"
        points={chart.series.map((point) => ({ label: point.x, value: point.y }))}
        formatLabel={(label) => label}
        maxPoints={24}
      />
    </div>
  );
}

function formatDelta(delta?: number) {
  if (delta === undefined) return '—';
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}% vs baseline`;
}
