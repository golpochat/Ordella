import { createApiClient, createBrowserTokenStorage } from '@shared-utils';
import { z } from 'zod';
import { getApiBaseUrl, getConfiguredValue, getLocationId, getTenantId } from './config';

const tokenStorage = createBrowserTokenStorage();

const api = createApiClient({
  baseUrl: getApiBaseUrl(),
  getAccessToken: () => tokenStorage.getAccessToken(),
  getTenantId: () => getConfiguredValue(tokenStorage.getTenantId(), getTenantId()),
});

const subscriptionCheckoutSchema = z.object({
  subscription: z.object({ id: z.string().uuid() }),
  sessionId: z.string(),
  url: z.string(),
});

export async function createSubscriptionCheckoutSession(body: {
  schedule: 'weekly' | 'biweekly' | 'monthly';
  orderType: 'pickup' | 'delivery' | 'online';
  totalPrice: number;
  deliveryDetails?: Record<string, unknown>;
  items: Array<{
    itemId: string;
    variantId?: string;
    quantity: number;
    modifiers?: Record<string, unknown>;
  }>;
}) {
  const data = await api.postData<unknown>('public/subscriptions/checkout-session', {
    ...body,
    locationId: getLocationId(),
  });
  return subscriptionCheckoutSchema.parse(data);
}
