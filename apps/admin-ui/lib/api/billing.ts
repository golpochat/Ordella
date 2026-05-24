import { createBrowserApiClient } from './browser';

export type BillingPlanInfo = {
  id: string;
  name: string;
  locationLimit: number | null;
  orderLimit: number | null;
  custom: boolean;
};

export type BillingUsage = {
  tenantId: string;
  planId: string;
  locationsUsed: number;
  locationLimit: number | null;
  ordersUsed: number;
  orderLimit: number | null;
  softLimitWarned: boolean;
  hardLimitExceeded: boolean;
  usagePeriodStart: string | null;
};

export type BillingSummary = {
  plan: string;
  planName: string;
  billingEmail: string | null;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  paymentMethod: Record<string, unknown>;
  stripeConfigured: boolean;
  usage: BillingUsage;
  plans: BillingPlanInfo[];
};

export type BillingInvoice = {
  id: string;
  status: string | null;
  amountDue: number;
  currency: string;
  created: string;
  hostedInvoiceUrl: string | null;
};

export async function fetchBillingSummary(): Promise<BillingSummary> {
  const api = createBrowserApiClient();
  const res = await api.getData<BillingSummary>('billing/usage');
  return res;
}

export async function fetchBillingInvoices(): Promise<BillingInvoice[]> {
  const api = createBrowserApiClient();
  return api.getData<BillingInvoice[]>('billing/invoices');
}

export async function subscribeToPlan(planId: string, paymentMethodId?: string): Promise<void> {
  const api = createBrowserApiClient();
  await api.post('billing/subscribe', { planId, paymentMethodId });
}

export async function changeBillingPlan(planId: string): Promise<void> {
  const api = createBrowserApiClient();
  await api.post('billing/change-plan', { planId });
}

export async function attachBillingPaymentMethod(paymentMethodId: string): Promise<void> {
  const api = createBrowserApiClient();
  await api.post('billing/payment-method', { paymentMethodId });
}

export async function createBillingPortalSession(returnUrl?: string): Promise<{ url: string }> {
  const api = createBrowserApiClient();
  return api.postData<{ url: string }>('billing/create-portal-session', { returnUrl });
}

export async function createSubscriptionCheckout(
  planId: string,
  successUrl?: string,
  cancelUrl?: string,
): Promise<{ sessionId: string; url: string }> {
  const api = createBrowserApiClient();
  return api.postData<{ sessionId: string; url: string }>(
    'billing/create-subscription-checkout',
    { planId, successUrl, cancelUrl },
  );
}

export async function cancelBillingSubscription(): Promise<void> {
  const api = createBrowserApiClient();
  await api.post('billing/cancel', {});
}
