import type { ApiClient } from '@shared-utils';
import { inventoryItemSchema, stockMovementSchema } from '@shared-utils';
import { z } from 'zod';

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
  return api.postData<unknown>('admin/inventory/adjustments', body);
}
