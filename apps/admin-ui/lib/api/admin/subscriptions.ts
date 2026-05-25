import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const subscriptionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  customerId: z.string().uuid(),
  locationId: z.string().uuid(),
  orderType: z.string(),
  schedule: z.string(),
  nextRunAt: z.string(),
  status: z.string(),
  totalPrice: z.string(),
  paymentMethodId: z.string().nullable(),
  deliveryDetails: z.record(z.unknown()).nullable(),
  createdAt: z.string(),
  customer: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
  }).optional(),
  items: z.array(z.object({
    id: z.string().uuid(),
    itemId: z.string().uuid(),
    quantity: z.number(),
    variantId: z.string().nullable(),
    modifiers: z.record(z.unknown()),
  })).default([]),
  orders: z.array(z.object({
    id: z.string().uuid(),
    orderId: z.string().uuid().nullable(),
    runAt: z.string(),
    status: z.string(),
    failureReason: z.string().nullable().optional(),
  })).default([]),
});

const subscriptionAnalyticsSchema = z.object({
  activeSubscriptions: z.number(),
  subscriptionRevenue: z.string(),
  recurringRevenueForecast: z.string(),
  churnRate: z.number(),
  topSubscriptionProducts: z.array(z.object({ itemId: z.string(), quantity: z.number() })),
});

export type AdminSubscription = z.infer<typeof subscriptionSchema>;
export type SubscriptionAnalytics = z.infer<typeof subscriptionAnalyticsSchema>;

export async function listSubscriptions(api: ApiClient) {
  const data = await api.getData<unknown[]>('subscriptions');
  return z.array(subscriptionSchema).parse(data);
}

export async function getSubscription(api: ApiClient, id: string) {
  const data = await api.getData<unknown>(`subscriptions/${id}`);
  return subscriptionSchema.parse(data);
}

export async function fetchSubscriptionAnalytics(api: ApiClient) {
  const data = await api.getData<unknown>('subscriptions/analytics');
  return subscriptionAnalyticsSchema.parse(data);
}

export async function pauseSubscription(api: ApiClient, id: string) {
  const data = await api.postData<unknown>(`subscriptions/${id}/pause`);
  return subscriptionSchema.parse(data);
}

export async function cancelSubscription(api: ApiClient, id: string) {
  const data = await api.postData<unknown>(`subscriptions/${id}/cancel`);
  return subscriptionSchema.parse(data);
}

export async function updateSubscription(api: ApiClient, id: string, body: { schedule?: string; nextRunAt?: string; status?: string }) {
  const data = await api.patch<{ success: boolean; data: unknown }>(`subscriptions/${id}`, body);
  return subscriptionSchema.parse((data as { data: unknown }).data);
}
