import { ApiError, createApiClient } from '@shared-utils';
import { z } from 'zod';
import {
  clearKdsAccessToken,
  getAccessToken,
  getApiBaseUrl,
  getKdsCredentials,
  getLocationId,
  getTenantId,
  setKdsAccessToken,
} from './config';

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

const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().optional(),
});

const api = createApiClient({
  baseUrl: getApiBaseUrl(),
  getAccessToken,
  getTenantId: () => getTenantId(),
});

async function loginForKds(): Promise<string | null> {
  const credentials = getKdsCredentials();
  if (!credentials) return null;
  const response = await api.postData<unknown>(
    'auth/login',
    {
      email: credentials.email,
      password: credentials.password,
      deviceFingerprint: 'kds-ui',
    },
    { skipAuth: true },
  );
  const parsed = loginResponseSchema.parse(response);
  setKdsAccessToken(parsed.accessToken);
  return parsed.accessToken;
}

async function withKdsAuth<T>(requestFactory: () => Promise<T>, retry = true): Promise<T> {
  try {
    if (!getAccessToken()) {
      await loginForKds();
    }
    return await requestFactory();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearKdsAccessToken();
      if (retry && await loginForKds()) {
        return withKdsAuth(requestFactory, false);
      }
      throw new Error('KDS access token is invalid or expired. Open Settings and enter staff credentials.');
    }
    throw error;
  }
}

export async function fetchFulfillmentFeed(includeCompleted = false) {
  const locationId = getLocationId();
  const data = await withKdsAuth(() =>
    api.getData<unknown[]>('orders/fulfillment-feed', {
      params: { locationId, includeCompleted: includeCompleted ? 'true' : 'false' },
    }),
  );
  return z.array(fulfillmentOrderSchema).parse(data);
}

export async function updateFulfillmentStatus(
  orderId: string,
  status: 'IN_PROGRESS' | 'READY' | 'COMPLETED',
  staffId?: string,
) {
  const data = await withKdsAuth(() =>
    api.postData<unknown>('orders/update-status', {
      orderId,
      status,
      staffId,
    }),
  );
  return fulfillmentOrderSchema.parse(data);
}

export async function acknowledgeOrder(orderId: string, staffId?: string) {
  await withKdsAuth(() => api.postData<unknown>('orders/acknowledge', { orderId, staffId }));
}

/** Legacy KDS routes — still available for item-level actions */
export async function fetchKdsOrders() {
  const data = await withKdsAuth(() => api.getData<unknown[]>('kds/orders'));
  return z.array(fulfillmentOrderSchema).parse(data);
}
