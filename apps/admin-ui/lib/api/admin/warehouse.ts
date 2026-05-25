import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const locationRefSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  locationType: z.string().optional(),
}).passthrough();

const productRefSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
}).passthrough();

const warehouseBinItemSchema = z.object({
  id: z.string().uuid(),
  binId: z.string().uuid(),
  itemId: z.string().uuid(),
  quantity: z.string(),
  item: productRefSchema.optional(),
});

export const warehouseZoneSchema = z.object({
  id: z.string().uuid(),
  warehouseId: z.string().uuid(),
  name: z.string(),
  type: z.enum(['picking', 'storage', 'receiving']),
  createdAt: z.string(),
  warehouse: locationRefSchema.optional(),
  bins: z.array(z.object({ id: z.string().uuid(), code: z.string() }).passthrough()).default([]),
});

export const warehouseBinSchema = z.object({
  id: z.string().uuid(),
  zoneId: z.string().uuid(),
  code: z.string(),
  capacity: z.number().nullable().optional(),
  createdAt: z.string(),
  zone: warehouseZoneSchema.omit({ bins: true }).optional(),
  contents: z.array(warehouseBinItemSchema).default([]),
});

export const warehouseDashboardSchema = z.object({
  warehouseCount: z.number(),
  totalStockItems: z.number(),
  inboundShipments: z.number(),
  outboundTransfers: z.number(),
  openPickTasks: z.number(),
  lowStockAlerts: z.number(),
  utilization: z.number(),
  fastMovingItems: z.array(z.object({
    itemId: z.string().uuid().nullable(),
    name: z.string(),
    available: z.string(),
  })),
});

const transferLineSchema = z.object({
  id: z.string().uuid(),
  stockItemId: z.string().uuid(),
  itemId: z.string().uuid().nullable(),
  itemName: z.string().nullable().optional(),
  quantity: z.string(),
  quantityRequested: z.string(),
  quantitySent: z.string(),
  quantityReceived: z.string(),
});

export const stockTransferSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  fromLocationId: z.string().uuid(),
  toLocationId: z.string().uuid(),
  fromLocationName: z.string().nullable().optional(),
  toLocationName: z.string().nullable().optional(),
  status: z.enum(['draft', 'pending', 'in_transit', 'received', 'completed', 'cancelled']),
  notes: z.string().nullable().optional(),
  lines: z.array(transferLineSchema).default([]),
  dispatchedAt: z.string().nullable().optional(),
  receivedAt: z.string().nullable().optional(),
  cancelledAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
});

export const pickTaskSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  transferId: z.string().uuid().nullable().optional(),
  orderId: z.string().uuid().nullable().optional(),
  status: z.enum(['pending', 'picking', 'completed']),
  assignedTo: z.string().uuid().nullable().optional(),
  createdAt: z.string(),
  warehouse: locationRefSchema.optional(),
  transfer: stockTransferSchema.partial().optional(),
});

export type WarehouseZone = z.infer<typeof warehouseZoneSchema>;
export type WarehouseBin = z.infer<typeof warehouseBinSchema>;
export type WarehouseDashboard = z.infer<typeof warehouseDashboardSchema>;
export type StockTransfer = z.infer<typeof stockTransferSchema>;
export type PickTask = z.infer<typeof pickTaskSchema>;

export async function getWarehouseDashboard(api: ApiClient): Promise<WarehouseDashboard> {
  const data = await api.getData<unknown>('warehouse/dashboard');
  return warehouseDashboardSchema.parse(data);
}

export async function listWarehouseZones(api: ApiClient): Promise<WarehouseZone[]> {
  const data = await api.getData<unknown[]>('warehouse/zones');
  return z.array(warehouseZoneSchema).parse(data);
}

export async function upsertWarehouseZone(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>(body.id ? 'warehouse/zones/update' : 'warehouse/zones/create', body);
  return warehouseZoneSchema.parse(data);
}

export async function listWarehouseBins(api: ApiClient): Promise<WarehouseBin[]> {
  const data = await api.getData<unknown[]>('warehouse/bins');
  return z.array(warehouseBinSchema).parse(data);
}

export async function upsertWarehouseBin(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('warehouse/bins/create', body);
  return warehouseBinSchema.parse(data);
}

export async function moveWarehouseBinItem(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown[]>('warehouse/bins/move-item', body);
  return z.array(warehouseBinSchema).parse(data);
}

export async function listStockTransfers(api: ApiClient): Promise<StockTransfer[]> {
  const data = await api.getData<unknown[]>('transfers/list');
  return z.array(stockTransferSchema).parse(data);
}

export async function createStockTransfer(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('transfers/create', body);
  return stockTransferSchema.parse(data);
}

export async function updateStockTransfer(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('transfers/update', body);
  return stockTransferSchema.parse(data);
}

export async function receiveStockTransfer(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('transfers/receive', body);
  return stockTransferSchema.parse(data);
}

export async function listPickTasks(api: ApiClient): Promise<PickTask[]> {
  const data = await api.getData<unknown[]>('picks/list');
  return z.array(pickTaskSchema).parse(data);
}

export async function completePickTask(api: ApiClient, pickTaskId: string) {
  const data = await api.postData<unknown>('picks/complete', { pickTaskId });
  return pickTaskSchema.parse(data);
}
