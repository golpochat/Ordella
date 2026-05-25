import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const hqScopeSchema = z.object({
  tenantIds: z.array(z.string().uuid()),
  franchiseeTenantIds: z.array(z.string().uuid()),
});

const hqLocationSchema = z.object({
  locationId: z.string().uuid(),
  tenantId: z.string().uuid(),
  tenantName: z.string(),
  locationName: z.string(),
  status: z.string(),
  orders: z.number(),
  revenue: z.string(),
  averageOrderValue: z.string(),
});

const hqOverviewSchema = z.object({
  scope: hqScopeSchema,
  totalRevenue: z.string(),
  totalOrders: z.number(),
  averageOrderValue: z.string(),
  totalCustomers: z.number(),
  activeLocations: z.number(),
  topPerformingLocations: z.array(hqLocationSchema),
  underperformingLocations: z.array(hqLocationSchema),
  alerts: z.object({
    lowStock: z.number(),
    outOfStock: z.number(),
    failedPayments: z.number(),
    offlinePos: z.number(),
  }),
});

const hqOrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().nullable(),
  tenantId: z.string().uuid(),
  tenantName: z.string(),
  locationId: z.string().uuid(),
  locationName: z.string(),
  orderType: z.string(),
  status: z.string(),
  paymentStatus: z.string(),
  total: z.string(),
  createdAt: z.string(),
});

const hqInventorySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  tenantName: z.string(),
  locationId: z.string().uuid(),
  locationName: z.string(),
  productId: z.string().uuid().nullable(),
  name: z.string(),
  sku: z.string(),
  quantityOnHand: z.string(),
  quantityReserved: z.string(),
  quantityAvailable: z.string(),
  reorderLevel: z.string().nullable(),
  status: z.enum(['low', 'out_of_stock']),
});

const hqStaffSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  role: z.string(),
  status: z.string(),
});

const hqCategorySchema = z.object({
  locationId: z.string().uuid(),
  locationName: z.string(),
  categoryId: z.string().uuid().nullable(),
  categoryName: z.string(),
  quantitySold: z.number(),
  revenue: z.string(),
});

const hqCustomerSchema = z.object({
  tenantId: z.string().uuid(),
  tenantName: z.string(),
  customers: z.number(),
  lifetimeValue: z.string(),
  avgOrderValue: z.string(),
});

const pagedSchema = <T extends z.ZodTypeAny>(row: T) =>
  z.object({
    rows: z.array(row),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
  });

export type HqOverview = z.infer<typeof hqOverviewSchema>;
export type HqLocation = z.infer<typeof hqLocationSchema>;
export type HqOrder = z.infer<typeof hqOrderSchema>;
export type HqInventoryItem = z.infer<typeof hqInventorySchema>;
export type HqStaffMember = z.infer<typeof hqStaffSchema>;
export type HqCategory = z.infer<typeof hqCategorySchema>;
export type HqCustomer = z.infer<typeof hqCustomerSchema>;

export async function getHqOverview(api: ApiClient) {
  const data = await api.getData<unknown>('hq/analytics/overview');
  return hqOverviewSchema.parse(data);
}

export async function listHqLocations(api: ApiClient) {
  const data = await api.getData<unknown[]>('hq/locations');
  return z.array(hqLocationSchema).parse(data);
}

export async function listHqOrders(api: ApiClient, params?: Record<string, string | number | undefined>) {
  const data = await api.getData<unknown>('hq/orders', { params });
  return pagedSchema(hqOrderSchema).parse(data);
}

export async function listHqInventory(api: ApiClient, params?: Record<string, string | number | undefined>) {
  const data = await api.getData<unknown[]>('hq/inventory', { params });
  return z.array(hqInventorySchema).parse(data);
}

export async function listHqStaff(api: ApiClient, params?: Record<string, string | number | undefined>) {
  const data = await api.getData<unknown>('hq/staff', { params });
  return pagedSchema(hqStaffSchema).parse(data);
}

export async function listHqCategories(api: ApiClient) {
  const data = await api.getData<unknown[]>('hq/analytics/categories');
  return z.array(hqCategorySchema).parse(data);
}

export async function listHqCustomers(api: ApiClient) {
  const data = await api.getData<unknown[]>('hq/analytics/customers');
  return z.array(hqCustomerSchema).parse(data);
}
