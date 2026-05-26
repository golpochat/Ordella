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
  type: z.enum(['ambient', 'chilled', 'frozen', 'produce', 'bakery', 'picking', 'storage', 'receiving']),
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
  status: z.enum(['pending', 'picking', 'picked', 'completed']),
  priority: z.number().optional(),
  batchId: z.string().uuid().nullable().optional(),
  waveId: z.string().uuid().nullable().optional(),
  slotId: z.string().uuid().nullable().optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  startedAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  warehouse: locationRefSchema.optional(),
  order: z.object({
    id: z.string().uuid(),
    orderNumber: z.string().nullable().optional(),
    total: z.string().optional(),
    items: z.array(z.unknown()).optional(),
  }).passthrough().optional(),
  transfer: stockTransferSchema.partial().optional(),
  lines: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string().nullable().optional(),
    quantity: z.number(),
    binCode: z.string().nullable(),
    zoneName: z.string().nullable(),
    status: z.string(),
  })).optional(),
  pickPath: z.array(z.object({
    zoneName: z.string(),
    binCode: z.string(),
    itemId: z.string().uuid(),
  })).optional(),
});

export const darkStoreOrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().nullable().optional(),
  locationId: z.string().uuid(),
  status: z.string(),
  total: z.string(),
  createdAt: z.string(),
  itemCount: z.number(),
  fulfilledBy: z.string(),
  pickTask: pickTaskSchema.nullable().optional(),
});

export const fulfillmentSlotSchema = z.object({
  id: z.string(),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  capacity: z.number(),
  createdAt: z.coerce.date(),
});

export const pickWaveSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid(),
  status: z.enum(['pending', 'picking', 'picked', 'completed']),
  pickerId: z.string().uuid().nullable().optional(),
  batchId: z.string().uuid().optional(),
  taskCount: z.number().optional(),
  tasks: z.array(pickTaskSchema).optional(),
  createdAt: z.string().optional(),
});

export type WarehouseZone = z.infer<typeof warehouseZoneSchema>;
export type WarehouseBin = z.infer<typeof warehouseBinSchema>;
export type WarehouseDashboard = z.infer<typeof warehouseDashboardSchema>;
export type StockTransfer = z.infer<typeof stockTransferSchema>;
export type PickTask = z.infer<typeof pickTaskSchema>;
export type DarkStoreOrder = z.infer<typeof darkStoreOrderSchema>;
export type FulfillmentSlot = z.infer<typeof fulfillmentSlotSchema>;
export type PickWave = z.infer<typeof pickWaveSchema>;

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

export async function assignWarehouseBinItem(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown[]>('warehouse/bins/assign-item', body);
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

export async function completePickTask(api: ApiClient, pickTaskId: string, lines?: Array<Record<string, unknown>>, missingItemIds?: string[]) {
  const data = await api.postData<unknown>('picks/complete', { pickTaskId, lines, missingItemIds });
  return pickTaskSchema.parse(data);
}

export async function listDarkStoreOrders(api: ApiClient, params?: { locationId?: string }): Promise<DarkStoreOrder[]> {
  const data = await api.getData<unknown[]>('dark-store/orders', { params });
  return z.array(darkStoreOrderSchema).parse(data);
}

export async function createDarkStorePickTask(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('dark-store/pick-task/create', body);
  return pickTaskSchema.parse(data);
}

export async function completeDarkStorePickTask(api: ApiClient, pickTaskId: string, lines?: Array<Record<string, unknown>>, missingItemIds?: string[]) {
  const data = await api.postData<unknown>('dark-store/pick-task/complete', { pickTaskId, lines, missingItemIds });
  return pickTaskSchema.parse(data);
}

export async function createPickWave(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('dark-store/wave/create', body);
  return pickWaveSchema.parse(data);
}

export async function listFulfillmentSlots(api: ApiClient, params?: { locationId?: string; from?: string; to?: string }): Promise<FulfillmentSlot[]> {
  const data = await api.getData<unknown[]>('dark-store/slots', { params });
  return z.array(fulfillmentSlotSchema).parse(data);
}
