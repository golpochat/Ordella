import type { ApiClient } from '@shared-utils';
import {
  dailySalesSummarySchema,
  deliveryPerformanceSummarySchema,
  inventoryMovementSummarySchema,
  promotionUsageSummarySchema,
} from '@shared-utils';
import { z } from 'zod';

const reportingMetricSchema = z.record(z.unknown());

export type EnterpriseReportParams = {
  from?: string;
  to?: string;
  locationId?: string;
  channel?: string;
  categoryId?: string;
  productId?: string;
  supplierId?: string;
  refresh?: string;
};

export type EnterpriseReport = Record<string, unknown>;

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

export async function getEnterpriseSummary(api: ApiClient, params?: EnterpriseReportParams) {
  const data = await api.getData<unknown>('reports/summary', { params });
  return reportingMetricSchema.parse(data);
}

export async function getReportingDashboard(api: ApiClient, params?: EnterpriseReportParams) {
  const data = await api.getData<unknown>('reports/dashboard', { params });
  return reportingMetricSchema.parse(data);
}

export async function getEnterpriseSales(api: ApiClient, params?: EnterpriseReportParams) {
  const data = await api.getData<unknown>('reports/sales', { params });
  return reportingMetricSchema.parse(data);
}

export async function getEnterpriseInventory(api: ApiClient, params?: EnterpriseReportParams) {
  const data = await api.getData<unknown>('reports/inventory', { params });
  return reportingMetricSchema.parse(data);
}

export async function getEnterpriseCustomers(api: ApiClient, params?: EnterpriseReportParams) {
  const data = await api.getData<unknown>('reports/customers', { params });
  return reportingMetricSchema.parse(data);
}

export async function getEnterpriseTax(api: ApiClient, params?: EnterpriseReportParams) {
  const data = await api.getData<unknown>('reports/tax', { params });
  return reportingMetricSchema.parse(data);
}

export async function getReportDrilldown(
  api: ApiClient,
  type: 'product' | 'location' | 'supplier',
  id: string,
  params?: EnterpriseReportParams,
) {
  const data = await api.getData<unknown>(`reports/drilldowns/${type}/${id}`, { params });
  return reportingMetricSchema.parse(data);
}

export async function createEnterpriseExport(
  api: ApiClient,
  body: {
    reportType: 'dashboard' | 'summary' | 'sales' | 'orders' | 'customers' | 'inventory' | 'delivery' | 'supplier' | 'promotions' | 'tax';
    format: 'csv' | 'pdf' | 'json';
    parameters?: EnterpriseReportParams;
    locationId?: string;
  },
) {
  const data = await api.postData<unknown>('reports/export/create', body);
  return z.object({
    jobId: z.string().uuid(),
    status: z.string(),
    fileUrl: z.string().nullable(),
    reportType: z.string(),
    format: z.string(),
    rowCount: z.number(),
  }).parse(data);
}
