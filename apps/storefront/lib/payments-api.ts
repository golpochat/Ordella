import { createApiClient } from '@shared-utils';
import { z } from 'zod';
import { getApiBaseUrl, getLocationId, getTenantId } from './config';

const api = createApiClient({
  baseUrl: getApiBaseUrl(),
  getAccessToken: () => null,
  getTenantId: () => getTenantId(),
});

const checkoutSessionSchema = z.object({
  sessionId: z.string(),
  url: z.string(),
});

const completeCheckoutSchema = z.object({
  orderId: z.string().uuid(),
  orderNumber: z.string().nullable(),
});

const paymentsConfigSchema = z.object({
  publishableKey: z.string().nullable(),
  stripeConfigured: z.boolean(),
});

export async function fetchPaymentsConfig() {
  const data = await api.getData<unknown>('payments/config');
  return paymentsConfigSchema.parse(data);
}

export async function createCheckoutSession(body: {
  orderType: 'delivery' | 'pickup' | 'in_store';
  customer: { name: string; phone: string; email?: string };
  customerId?: string;
  items: Array<{
    itemId: string;
    variantId?: string;
    modifiers?: string[];
    quantity: number;
  }>;
  delivery?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode?: string;
    instructions?: string;
  };
  notes?: string;
  totals: { grandTotal: string; subtotal?: string; taxTotal?: string };
  currency?: string;
  loyaltyRedeemPoints?: number;
  giftCardCode?: string;
  giftCardAmount?: number;
  storeCreditAmount?: number;
}) {
  const locationId = getLocationId();
  const data = await api.postData<unknown>('payments/checkout-session', {
    locationId,
    ...body,
  });
  return checkoutSessionSchema.parse(data);
}

export async function completeCheckoutSession(sessionId: string) {
  const data = await api.postData<unknown>(
    `payments/checkout/complete?session_id=${encodeURIComponent(sessionId)}`,
    {},
  );
  return completeCheckoutSchema.parse(data);
}
