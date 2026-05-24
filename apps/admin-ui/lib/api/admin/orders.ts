import type { ApiClient } from '@shared-utils';
import { orderSchema } from '@shared-utils';
import { z } from 'zod';

export async function listOrders(
  api: ApiClient,
  params?: {
    status?: string;
    channel?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  },
) {
  const data = await api.getData<unknown[]>('admin/orders', { params });
  return z.array(orderSchema).parse(data);
}

export async function getOrder(api: ApiClient, orderId: string) {
  const data = await api.getData<unknown>(`admin/orders/${orderId}`);
  return orderSchema.parse(data);
}

export async function updateOrderStatus(
  api: ApiClient,
  orderId: string,
  body: { status: string; reason?: string },
) {
  const data = await api.patch<{ success: boolean; data: unknown }>(
    `admin/orders/${orderId}/status`,
    body,
  );
  return orderSchema.parse(data.data);
}

export async function resendOrderNotifications(api: ApiClient, orderId: string) {
  return api.postData<{ sent: boolean }>(`admin/orders/${orderId}/resend-notifications`);
}
