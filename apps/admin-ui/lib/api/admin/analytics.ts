import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

export type AnalyticsQueryParams = {
  from?: string;
  to?: string;
  locationId?: string;
};

const overviewSchema = z.object({
  salesTotal: z.string(),
  ordersTotal: z.number().int(),
  avgOrderValue: z.string(),
  growthPercent: z.number().nullable(),
  fulfillmentTimeAvgMinutes: z.number().nullable(),
  deliveryTimeAvgMinutes: z.number().nullable(),
  deliveryEnabled: z.boolean(),
});

const dayPointSchema = z.object({
  date: z.string(),
  revenue: z.string(),
  orders: z.number().int(),
});

const channelPointSchema = z.object({
  channel: z.string(),
  label: z.string(),
  revenue: z.string(),
  orders: z.number().int(),
});

const locationPointSchema = z.object({
  locationId: z.string().uuid(),
  locationName: z.string(),
  revenue: z.string(),
  orders: z.number().int(),
});

const topItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(),
  quantitySold: z.number().int(),
  revenue: z.string(),
});

const categoryPointSchema = z.object({
  categoryId: z.string().uuid().nullable(),
  categoryName: z.string(),
  revenue: z.string(),
  quantitySold: z.number().int(),
});

const lowInventorySchema = z.object({
  id: z.string().uuid(),
  locationId: z.string().uuid(),
  name: z.string(),
  sku: z.string(),
  quantityOnHand: z.string(),
  reorderLevel: z.string().nullable(),
  status: z.enum(['low', 'out_of_stock']),
});

const locationOptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export type AnalyticsOverview = z.infer<typeof overviewSchema>;
export type AnalyticsDayPoint = z.infer<typeof dayPointSchema>;
export type AnalyticsChannelPoint = z.infer<typeof channelPointSchema>;
export type AnalyticsLocationPoint = z.infer<typeof locationPointSchema>;
export type AnalyticsTopItem = z.infer<typeof topItemSchema>;
export type AnalyticsCategoryPoint = z.infer<typeof categoryPointSchema>;
export type AnalyticsLowInventory = z.infer<typeof lowInventorySchema>;

export async function getAnalyticsOverview(api: ApiClient, params?: AnalyticsQueryParams) {
  const data = await api.getData<unknown>('analytics/overview', { params });
  return overviewSchema.parse(data);
}

export async function getRevenueByDay(api: ApiClient, params?: AnalyticsQueryParams) {
  const data = await api.getData<unknown[]>('analytics/revenue-by-day', { params });
  return z.array(dayPointSchema).parse(data);
}

export async function getOrdersByDay(api: ApiClient, params?: AnalyticsQueryParams) {
  const data = await api.getData<unknown[]>('analytics/orders-by-day', { params });
  return z.array(dayPointSchema).parse(data);
}

export async function getSalesByChannel(api: ApiClient, params?: AnalyticsQueryParams) {
  const data = await api.getData<unknown[]>('analytics/sales-by-channel', { params });
  return z.array(channelPointSchema).parse(data);
}

export async function getSalesByLocation(api: ApiClient, params?: AnalyticsQueryParams) {
  const data = await api.getData<unknown[]>('analytics/sales-by-location', { params });
  return z.array(locationPointSchema).parse(data);
}

export async function getTopItems(api: ApiClient, params?: AnalyticsQueryParams) {
  const data = await api.getData<unknown[]>('analytics/top-items', { params });
  return z.array(topItemSchema).parse(data);
}

export async function getCategoryPerformance(api: ApiClient, params?: AnalyticsQueryParams) {
  const data = await api.getData<unknown[]>('analytics/category-performance', { params });
  return z.array(categoryPointSchema).parse(data);
}

export async function getLowInventory(api: ApiClient, params?: AnalyticsQueryParams) {
  const data = await api.getData<unknown[]>('analytics/low-inventory', { params });
  return z.array(lowInventorySchema).parse(data);
}

const recentOrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().nullable(),
  orderType: z.string(),
  channelLabel: z.string(),
  status: z.string(),
  total: z.string(),
  locationId: z.string().uuid(),
  createdAt: z.string(),
});

export type AnalyticsRecentOrder = z.infer<typeof recentOrderSchema>;

export async function getRecentOrders(api: ApiClient, params?: AnalyticsQueryParams) {
  const data = await api.getData<unknown[]>('analytics/recent-orders', { params });
  return z.array(recentOrderSchema).parse(data);
}

export async function getAnalyticsLocations(api: ApiClient) {
  const data = await api.getData<unknown[]>('analytics/locations');
  return z.array(locationOptionSchema).parse(data);
}

export function defaultAnalyticsRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 6);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}
