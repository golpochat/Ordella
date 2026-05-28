'use client';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useId, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, CardContent, Flex, Stack } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { getForecastSummary, regenerateForecast, updateForecastModel } from '@/lib/api/admin/forecasting';
import { getErrorMessage } from '@/lib/utils';
import {
  DateRangePicker,
  FilterActions,
  FilterApplyButton,
  FilterBar,
  FilterGroup,
  FilterInput,
  FilterItem,
  FilterSelect,
  paramsFromForm,
} from '@/components/ui/admin-filter';

const horizons = [7, 14, 30] as const;
const modelTypes = ['simple', 'exponential_smoothing', 'ai_embedding'] as const;

export function ForecastingControls() {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const horizonId = useId();
  const modelTypeId = useId();
  const [modelJson, setModelJson] = useState('{"historyDays":28,"smoothingAlpha":0.35,"serviceLevelDays":3}');
  const [modelType, setModelType] = useState<typeof modelTypes[number]>('simple');
    const [loading, setLoading] = useState(false);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = paramsFromForm(
      event.currentTarget,
      ['horizonDays', 'locationId', 'categoryId', 'productId', 'generatedForDate', 'fromDate', 'toDate'],
      { preserve: searchParams },
    );
    router.push(`${pathname}?${params.toString()}`);
  }

  async function regenerate() {
    await run(async () => {

      const api = createBrowserApiClient();
      await regenerateForecast(api, currentParams());
      toastSuccess('Forecast regenerated');
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
      toastSuccess('Model parameters saved');
      router.refresh();
    });
  }

  async function exportForecast() {
    await run(async () => {
      const api = createBrowserApiClient();
      const data = await getForecastSummary(api, currentParams());
      const encoded = encodeURIComponent(JSON.stringify(data, null, 2));
      window.location.href = `data:application/json;charset=utf-8,${encoded}`;
      toastSuccess('Forecast export prepared');
    });
  }

  async function run(action: () => Promise<void>) {
    setLoading(true);
    try {
      await action();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function currentParams() {
    return {
      horizonDays: Number(searchParams.get('horizonDays') ?? 7),
      locationId: searchParams.get('locationId') ?? undefined,
      categoryId: searchParams.get('categoryId') ?? undefined,
      productId: searchParams.get('productId') ?? undefined,
      generatedForDate: searchParams.get('generatedForDate') ?? undefined,
      fromDate: searchParams.get('fromDate') ?? undefined,
      toDate: searchParams.get('toDate') ?? undefined,
    };
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Stack gap="lg">
          <FilterBar onSubmit={applyFilters}>
            <FilterGroup columns={4}>
              <FilterItem label="Horizon" htmlFor={horizonId} active={Boolean(searchParams.get('horizonDays'))}>
                <FilterSelect id={horizonId} name="horizonDays" defaultValue={searchParams.get('horizonDays') ?? '7'}>
                  {horizons.map((days) => (
                    <option key={days} value={days}>
                      {days} days
                    </option>
                  ))}
                </FilterSelect>
              </FilterItem>
              <FilterItem label="Location" htmlFor="forecast-location" active={Boolean(searchParams.get('locationId'))}>
                <FilterInput
                  id="forecast-location"
                  name="locationId"
                  placeholder="Location UUID"
                  defaultValue={searchParams.get('locationId') ?? ''}
                />
              </FilterItem>
              <FilterItem label="Category" htmlFor="forecast-category" active={Boolean(searchParams.get('categoryId'))}>
                <FilterInput
                  id="forecast-category"
                  name="categoryId"
                  placeholder="Category UUID"
                  defaultValue={searchParams.get('categoryId') ?? ''}
                />
              </FilterItem>
              <FilterItem label="Product" htmlFor="forecast-product" active={Boolean(searchParams.get('productId'))}>
                <FilterInput
                  id="forecast-product"
                  name="productId"
                  placeholder="Product UUID"
                  defaultValue={searchParams.get('productId') ?? ''}
                />
              </FilterItem>
            </FilterGroup>
            <DateRangePicker
              fromId="forecast-from"
              toId="forecast-to"
              fromName="fromDate"
              toName="toDate"
              fromDefaultValue={searchParams.get('fromDate') ?? ''}
              toDefaultValue={searchParams.get('toDate') ?? ''}
              fromActive={Boolean(searchParams.get('fromDate'))}
              toActive={Boolean(searchParams.get('toDate'))}
            />
            <FilterItem
              label="Generated for"
              htmlFor="forecast-generated"
              active={Boolean(searchParams.get('generatedForDate'))}
            >
              <FilterInput
                id="forecast-generated"
                name="generatedForDate"
                type="date"
                defaultValue={searchParams.get('generatedForDate') ?? ''}
              />
            </FilterItem>
            <FilterActions>
              <FilterApplyButton>Apply forecast filters</FilterApplyButton>
            </FilterActions>
          </FilterBar>

          <FilterBar as="div">
            <FilterGroup columns={4}>
              <FilterItem label="Model type" htmlFor={modelTypeId}>
                <FilterSelect
                  id={modelTypeId}
                  value={modelType}
                  onChange={(event) => setModelType(event.target.value as typeof modelTypes[number])}
                >
                  {modelTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </FilterSelect>
              </FilterItem>
              <FilterItem label="Parameters (JSON)" htmlFor="forecast-model-json" className="min-[481px]:max-w-md">
                <FilterInput
                  id="forecast-model-json"
                  value={modelJson}
                  onChange={(event) => setModelJson(event.target.value)}
                />
              </FilterItem>
            </FilterGroup>
            <FilterActions>
              <Button type="button" variant="outline" disabled={loading} onClick={() => void saveModel()}>
                Save model
              </Button>
              <Button type="button" isLoading={loading} loadingLabel="Working…" onClick={() => void regenerate()}>
                Regenerate forecast
              </Button>
            </FilterActions>
          </FilterBar>

          <Flex gap="sm" wrap align="center">
            <Button type="button" variant="outline" disabled={loading} onClick={() => void exportForecast()}>
              Export forecast
            </Button>
            </Flex>
        </Stack>
      </CardContent>
    </Card>
  );
}
