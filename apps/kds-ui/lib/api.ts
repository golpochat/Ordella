import { createApiClient } from '@shared-utils';
import { z } from 'zod';
import { getApiBaseUrl, getLocationId, getTenantId } from './config';

const lineItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  itemName: z.string(),
  variantId: z.string().uuid().nullable(),
  variantName: z.string().nullable(),
  sku: z.string().nullable(),
  modifiers: z.array(z.string()),
  quantity: z.number().int(),
  notes: z.string().nullable(),
  kdsStatus: z.string(),
});

export const fulfillmentOrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().nullable(),
  status: z.string(),
  fulfillmentStatus: z.string(),
  orderType: z.string(),
  locationId: z.string().uuid(),
  createdAt: z.string(),
  customerInfo: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
    })
    .nullable()
    .optional(),
  lineItems: z.array(lineItemSchema),
  driverStatus: z.string().nullable().optional(),
  driverStatusLabel: z.string().nullable().optional(),
  driverName: z.string().nullable().optional(),
});

export type FulfillmentOrder = z.infer<typeof fulfillmentOrderSchema>;

const api = createApiClient({
  baseUrl: getApiBaseUrl(),
  getAccessToken: () =>
    typeof window === 'undefined' ? null : localStorage.getItem('ordella.accessToken'),
  getTenantId: () => getTenantId(),
});

export async function fetchFulfillmentFeed(includeCompleted = false) {
  const locationId = getLocationId();
  const data = await api.getData<unknown[]>('orders/fulfillment-feed', {
    params: { locationId, includeCompleted: includeCompleted ? 'true' : 'false' },
  });
  return z.array(fulfillmentOrderSchema).parse(data);
}

export async function updateFulfillmentStatus(
  orderId: string,
  status: 'IN_PROGRESS' | 'READY' | 'COMPLETED',
  staffId?: string,
) {
  const data = await api.postData<unknown>('orders/update-status', {
    orderId,
    status,
    staffId,
  });
  return fulfillmentOrderSchema.parse(data);
}

export async function acknowledgeOrder(orderId: string, staffId?: string) {
  await api.postData<unknown>('orders/acknowledge', { orderId, staffId });
}

/** Legacy KDS routes — still available for item-level actions */
export async function fetchKdsOrders() {
  const data = await api.getData<unknown[]>('kds/orders');
  return z.array(fulfillmentOrderSchema).parse(data);
}
