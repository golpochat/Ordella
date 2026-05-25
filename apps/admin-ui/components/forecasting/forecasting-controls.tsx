'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { getForecastSummary, regenerateForecast, updateForecastModel } from '@/lib/api/admin/forecasting';
import { getErrorMessage } from '@/lib/utils';

const horizons = [7, 14, 30] as const;
const modelTypes = ['simple', 'exponential_smoothing', 'ai_embedding'] as const;

export function ForecastingControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [modelJson, setModelJson] = useState('{"historyDays":28,"smoothingAlpha":0.35,"serviceLevelDays":3}');
  const [modelType, setModelType] = useState<typeof modelTypes[number]>('simple');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ['horizonDays', 'locationId', 'generatedForDate']) {
      const value = String(formData.get(key) ?? '').trim();
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  async function regenerate() {
    await run(async () => {
      const api = createBrowserApiClient();
      await regenerateForecast(api, currentParams());
      setMessage('Forecast regenerated');
      router.refresh();
    });
  }

  async function saveModel() {
    await run(async () => {
      const api = createBrowserApiClient();
      await updateForecastModel(api, {
        modelType,
        parameters: JSON.parse(modelJson) as Record<string, unknown>,
        isActive: true,
      });
      setMessage('Model parameters saved');
      router.refresh();
    });
  }

  async function exportForecast() {
    await run(async () => {
      const api = createBrowserApiClient();
      const data = await getForecastSummary(api, currentParams());
      const encoded = encodeURIComponent(JSON.stringify(data, null, 2));
      window.location.href = `data:application/json;charset=utf-8,${encoded}`;
      setMessage('Forecast export prepared');
    });
  }

  async function run(action: () => Promise<void>) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function currentParams() {
    return {
      horizonDays: Number(searchParams.get('horizonDays') ?? 7),
      locationId: searchParams.get('locationId') ?? undefined,
      generatedForDate: searchParams.get('generatedForDate') ?? undefined,
    };
  }

  return (
    <div className="mb-4 space-y-4 rounded-lg border bg-card p-4">
      <form className="grid gap-3 md:grid-cols-4" onSubmit={applyFilters}>
        <select
          name="horizonDays"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          defaultValue={searchParams.get('horizonDays') ?? '7'}
        >
          {horizons.map((days) => (
            <option key={days} value={days}>
              {days} days
            </option>
          ))}
        </select>
        <Input name="locationId" placeholder="Location UUID" defaultValue={searchParams.get('locationId') ?? ''} />
        <Input name="generatedForDate" type="date" defaultValue={searchParams.get('generatedForDate') ?? ''} />
        <Button type="submit">Apply forecast filters</Button>
      </form>

      <div className="grid gap-3 md:grid-cols-4">
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={modelType}
          onChange={(event) => setModelType(event.target.value as typeof modelTypes[number])}
        >
          {modelTypes.map((type) => (
            <option key={type} value={type}>
              {type.replace('_', ' ')}
            </option>
          ))}
        </select>
        <Input value={modelJson} onChange={(event) => setModelJson(event.target.value)} />
        <Button type="button" variant="outline" disabled={loading} onClick={saveModel}>
          Save model
        </Button>
        <Button type="button" disabled={loading} onClick={regenerate}>
          Regenerate forecast
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" disabled={loading} onClick={exportForecast}>
          Export forecast
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
