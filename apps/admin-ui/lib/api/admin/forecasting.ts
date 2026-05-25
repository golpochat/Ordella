import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

export type ForecastParams = {
  forecastType?: 'summary' | 'demand' | 'inventory' | 'staffing' | 'delivery_capacity' | 'warehouse_replenishment';
  locationId?: string;
  horizonDays?: number;
  generatedForDate?: string;
};

const forecastSchema = z.record(z.unknown());

export type ForecastPayload = z.infer<typeof forecastSchema>;

export async function getForecastSummary(api: ApiClient, params?: ForecastParams) {
  const data = await api.getData<unknown>('forecast/summary', { params });
  return forecastSchema.parse(data);
}

export async function getDemandForecast(api: ApiClient, params?: ForecastParams) {
  const data = await api.getData<unknown>('forecast/demand', { params });
  return forecastSchema.parse(data);
}

export async function getInventoryForecast(api: ApiClient, params?: ForecastParams) {
  const data = await api.getData<unknown>('forecast/inventory', { params });
  return forecastSchema.parse(data);
}

export async function getStaffingForecast(api: ApiClient, params?: ForecastParams) {
  const data = await api.getData<unknown>('forecast/staffing', { params });
  return forecastSchema.parse(data);
}

export async function regenerateForecast(api: ApiClient, body: ForecastParams) {
  const data = await api.postData<unknown>('forecast/generate', { ...body, refresh: true });
  return forecastSchema.parse(data);
}

export async function updateForecastModel(
  api: ApiClient,
  body: {
    modelType: 'simple' | 'exponential_smoothing' | 'ai_embedding';
    parameters: Record<string, unknown>;
    isActive?: boolean;
  },
) {
  return api.postData<unknown>('forecast/model/update', body);
}
