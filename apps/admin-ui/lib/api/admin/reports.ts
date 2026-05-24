import type { ApiClient } from '@shared-utils';
import {
  dailySalesSummarySchema,
  deliveryPerformanceSummarySchema,
  inventoryMovementSummarySchema,
  promotionUsageSummarySchema,
} from '@shared-utils';
import { z } from 'zod';

export async function getDailySales(api: ApiClient, params?: { from?: string; to?: string }) {
  const data = await api.getData<unknown[]>('admin/reports/sales', { params });
  return z.array(dailySalesSummarySchema).parse(data);
}

export async function getInventoryReport(api: ApiClient, params?: { from?: string; to?: string }) {
  const data = await api.getData<unknown[]>('admin/reports/inventory', { params });
  return z.array(inventoryMovementSummarySchema).parse(data);
}

export async function getDeliveryReport(api: ApiClient, params?: { from?: string; to?: string }) {
  const data = await api.getData<unknown[]>('admin/reports/delivery', { params });
  return z.array(deliveryPerformanceSummarySchema).parse(data);
}

export async function getPromotionUsageReport(
  api: ApiClient,
  params?: { from?: string; to?: string },
) {
  const data = await api.getData<unknown[]>('admin/reports/promotions', { params });
  return z.array(promotionUsageSummarySchema).parse(data);
}
