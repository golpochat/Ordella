import type { ApiClient } from '@shared-utils';
import {
  inventoryItemSchema,
  inventoryListItemSchema,
  inventorySummarySchema,
  stockMovementSchema,
} from '@shared-utils';
import { z } from 'zod';

export async function listInventory(
  api: ApiClient,
  params?: { locationId?: string; search?: string },
) {
  const data = await api.getData<unknown[]>('inventory', { params });
  return z.array(inventoryListItemSchema).parse(data);
}

export async function listLowStock(api: ApiClient, params?: { locationId?: string }) {
  const data = await api.getData<unknown[]>('inventory/low-stock', { params });
  return z.array(inventoryListItemSchema).parse(data);
}

export async function getInventorySummary(api: ApiClient, params?: { locationId?: string }) {
  const data = await api.getData<unknown>('inventory/summary', { params });
  return inventorySummarySchema.parse(data);
}

export async function updateInventoryItem(
  api: ApiClient,
  body: {
    id: string;
    stockLevel?: number;
    reorderPoint?: number;
    isActive?: boolean;
  },
) {
  const data = await api.postData<unknown>('inventory/update', body);
  return inventoryListItemSchema.nullable().parse(data);
}

export async function adjustInventory(
  api: ApiClient,
  body: {
    stockItemId: string;
    locationId: string;
    change: number;
    reason: 'manual' | 'sale' | 'refund' | 'waste' | 'correction';
    notes?: string;
  },
) {
  return api.postData<unknown>('inventory/adjust', body);
}

/** @deprecated Use listInventory — kept for movements page compatibility */
export async function listStock(
  api: ApiClient,
  params?: { locationId?: string; search?: string },
) {
  const data = await api.getData<unknown[]>('admin/inventory/stock', { params });
  return z.array(inventoryItemSchema).parse(data);
}

export async function listMovements(
  api: ApiClient,
  params?: { from?: string; to?: string; stockItemId?: string },
) {
  const data = await api.getData<unknown[]>('admin/inventory/movements', { params });
  return z.array(stockMovementSchema).parse(data);
}

export async function createAdjustment(
  api: ApiClient,
  body: {
    stockItemId: string;
    locationId: string;
    kind: 'manual' | 'correction' | 'wastage';
    delta: number;
    reason?: string;
  },
) {
  return adjustInventory(api, {
    stockItemId: body.stockItemId,
    locationId: body.locationId,
    change: body.delta,
    reason: body.kind === 'wastage' ? 'waste' : body.kind === 'correction' ? 'correction' : 'manual',
    notes: body.reason,
  });
}
