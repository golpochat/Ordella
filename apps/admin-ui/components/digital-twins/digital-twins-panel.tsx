'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
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
  const api = useMemo(() => createBrowserApiClient(), []);
  const [selectedTwinId, setSelectedTwinId] = useState(initialDetail?.twin.id ?? twins[0]?.id ?? '');
  const [detail, setDetail] = useState<TwinDetail | null>(initialDetail);
  const [params, setParams] = useState<ScenarioParameters>(DEFAULT_PARAMS);
  const [scenarioName, setScenarioName] = useState('Custom scenario');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [compareRows, setCompareRows] = useState<Array<{ scenarioId: string; baselineDeltas: Record<string, number> }>>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadTwin(id: string) {
    setError(null);
    try {
      const next = await getDigitalTwin(api, id);
      setDetail(next);
      setSelectedTwinId(id);
      const baseline = next.scenarios.find((s) => s.isBaseline);
      if (baseline?.parameters) {
        setParams({ ...DEFAULT_PARAMS, ...(baseline.parameters as ScenarioParameters) });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleSimulate() {
    if (!selectedTwinId) return;
    setError(null);
    try {
      const res = await runSimulation(api, selectedTwinId, { parameters: params, simulationDomain: 'full' });
      setResult(res.result);
      setMessage(res.fromCache ? 'Loaded cached simulation result.' : 'Simulation completed (sandbox).');
      await loadTwin(selectedTwinId);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleSaveScenario() {
    if (!selectedTwinId) return;
    setError(null);
    try {
      await saveScenario(api, selectedTwinId, {
        name: scenarioName,
        parameters: params,
        extremeConditions: { weatherImpact: params.weatherImpact, supplyChainDelayDays: params.supplyChainDelayDays },
      });
      setMessage(`Scenario "${scenarioName}" saved.`);
      await loadTwin(selectedTwinId);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleCompare() {
    if (!selectedTwinId || !detail) return;
    setError(null);
    try {
      const ids = detail.scenarios.slice(0, 3).map((s) => s.id);
      const comparison = await compareScenarios(api, selectedTwinId, ids);
      const rows = (comparison.comparisons as Array<{ scenarioId: string; baselineDeltas: Record<string, number> }>) ?? [];
      setCompareRows(rows);
      setMessage(`Compared ${rows.length} scenarios side-by-side.`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        <Metric title="Digital twins" value={dashboard?.twinCount ?? twins.length} />
        <Metric title="Scenarios" value={dashboard?.scenarioCount ?? detail?.scenarios.length ?? 0} />
        <Metric title="Simulation runs" value={dashboard?.runCount ?? 0} />
        <Metric title="Cached results" value={dashboard?.cachedResults ?? 0} />
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Scenario builder</CardTitle>
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={selectedTwinId}
            onChange={(e) => void loadTwin(e.target.value)}
          >
            {twins.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.twinType})</option>
            ))}
          </select>
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
                    <Badge key={i} variant="secondary">{String(risk.level)} · {String(risk.message)}</Badge>
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
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Scenario</th>
                  <th className="py-2 pr-4">Revenue Δ</th>
                  <th className="py-2 pr-4">Margin Δ</th>
                  <th className="py-2 pr-4">Stockouts Δ</th>
                  <th className="py-2">Labor Δ</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={row.scenarioId} className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs">{row.scenarioId.slice(0, 8)}…</td>
                    <td className="py-2 pr-4">{formatDelta(row.baselineDeltas.revenue)}</td>
                    <td className="py-2 pr-4">{formatDelta(row.baselineDeltas.margin)}</td>
                    <td className="py-2 pr-4">{formatDelta(row.baselineDeltas.stockoutRate)}</td>
                    <td className="py-2">{formatDelta(row.baselineDeltas.laborCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
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
  const max = Math.max(...chart.series.map((p) => p.y), 1);
  return (
    <div>
      <p className="mb-1 text-sm font-medium">{title}</p>
      <div className="flex h-24 items-end gap-1">
        {chart.series.map((point) => (
          <div
            key={point.x}
            className="flex-1 rounded-t bg-primary/70"
            style={{ height: `${Math.max(4, (point.y / max) * 100)}%` }}
            title={`${point.x}: ${point.y}`}
          />
        ))}
      </div>
    </div>
  );
}

function formatDelta(delta?: number) {
  if (delta === undefined) return '—';
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}% vs baseline`;
}
