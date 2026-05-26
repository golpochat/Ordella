import { ApiError, createApiClient } from '@shared-utils';
import { z } from 'zod';
import { getApiBaseUrl } from './config';
import { clearSession, getDriverAccessToken, getSession } from './session';
import type { DeliveryTaskStatus } from './delivery-status';

function createDriverApiClient() {
  const session = getSession();
  return createApiClient({
    baseUrl: getApiBaseUrl(),
    getAccessToken: () => getDriverAccessToken(session),
    getTenantId: () => session.tenantId || null,
  });
}

async function withDriverSession<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearSession();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    throw error;
  }
}

const orderLineSchema = z.object({
  name: z.string(),
  quantity: z.number().int(),
});

export const driverOrderSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  orderNumber: z.string().nullable(),
  orderType: z.string(),
  status: z.enum([
    'pending',
    'assigned',
    'en_route',
    'delivered',
    'cancelled',
    'failed',
  ]),
  driverId: z.string().uuid().nullable(),
  customerName: z.string(),
  customerPhone: z.string(),
  deliveryAddress: z.string().nullable(),
  itemsSummary: z.array(orderLineSchema),
  notes: z.string().nullable(),
  createdAt: z.string(),
  eta: z.string().nullable(),
  metadata: z.record(z.unknown()).default({}),
  isPickup: z.boolean(),
});

export type DriverOrder = z.infer<typeof driverOrderSchema>;

function parseOrders(data: unknown): DriverOrder[] {
  return z.array(driverOrderSchema).parse(data);
}

export async function fetchAssignedOrders(): Promise<DriverOrder[]> {
  const api = createDriverApiClient();
  const { driverId } = getSession();
  const response = await withDriverSession(
    api.get<{ success: boolean; data: unknown }>('driver/orders/assigned', {
      params: { driverId },
    }),
  );
  return parseOrders(response.data);
}

export async function fetchAvailableOrders(): Promise<DriverOrder[]> {
  const api = createDriverApiClient();
  const { driverId } = getSession();
  const response = await withDriverSession(
    api.get<{ success: boolean; data: unknown }>('driver/orders/available', {
      params: { driverId },
    }),
  );
  return parseOrders(response.data);
}

export async function fetchCompletedOrders(): Promise<DriverOrder[]> {
  const api = createDriverApiClient();
  const { driverId } = getSession();
  const response = await withDriverSession(
    api.get<{ success: boolean; data: unknown }>('driver/orders/completed', {
      params: { driverId },
    }),
  );
  return parseOrders(response.data);
}

export async function acceptDriverOrder(orderId: string): Promise<DriverOrder> {
  const api = createDriverApiClient();
  const { driverId } = getSession();
  const response = await withDriverSession(
    api.post<{ success: boolean; data: unknown }>('driver/orders/accept', {
      orderId,
      driverId,
    }),
  );
  return driverOrderSchema.parse(response.data);
}

export async function startDriverOrder(orderId: string): Promise<DriverOrder> {
  const api = createDriverApiClient();
  const { driverId } = getSession();
  const response = await withDriverSession(
    api.post<{ success: boolean; data: unknown }>('driver/orders/start', {
      orderId,
      driverId,
    }),
  );
  return driverOrderSchema.parse(response.data);
}

export async function completeDriverOrder(orderId: string): Promise<DriverOrder> {
  const api = createDriverApiClient();
  const { driverId } = getSession();
  const response = await withDriverSession(
    api.post<{ success: boolean; data: unknown }>('driver/orders/complete', {
      orderId,
      driverId,
    }),
  );
  return driverOrderSchema.parse(response.data);
}

export async function pickupCompleteDriverOrder(orderId: string): Promise<DriverOrder> {
  const api = createDriverApiClient();
  const { driverId } = getSession();
  const response = await withDriverSession(
    api.post<{ success: boolean; data: unknown }>('driver/orders/pickup-complete', {
      orderId,
      driverId,
    }),
  );
  return driverOrderSchema.parse(response.data);
}

export function orderTypeLabel(orderType: string, isPickup: boolean): string {
  if (isPickup || orderType === 'pickup') return 'Business pickup';
  if (orderType === 'delivery') return 'Delivery';
  return 'Order';
}

export function formatOrderTimestamp(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function nextActionForOrder(order: DriverOrder): {
  label: string;
  action: 'accept' | 'start' | 'complete' | 'pickup-complete' | null;
} | null {
  if (order.status === 'delivered' || order.status === 'cancelled' || order.status === 'failed') {
    return null;
  }

  if (order.status === 'pending') {
    return { label: 'Accept order', action: 'accept' };
  }

  if (order.status === 'assigned') {
    if (order.isPickup) {
      return { label: 'Mark pickup complete', action: 'pickup-complete' };
    }
    return { label: 'Start delivery', action: 'start' };
  }

  if (order.status === 'en_route') {
    if (order.isPickup) {
      return { label: 'Complete pickup', action: 'pickup-complete' };
    }
    return { label: 'Mark as delivered', action: 'complete' };
  }

  return null;
}

export type { DeliveryTaskStatus };
