import type { ApiClient } from '@shared-utils';
import {
  fetchTenantList,
  switchTenantContext,
  type TenantOption,
} from '@shared-utils';
import { createBrowserApiClient, browserTokenStorage } from '@/lib/api/browser';

export type { TenantOption };

export async function loadTenantsForSwitcher(): Promise<TenantOption[]> {
  return fetchTenantList(createBrowserApiClient());
}

export async function switchActiveTenant(tenantId: string): Promise<void> {
  const client = createBrowserApiClient();
  await switchTenantContext(client, browserTokenStorage, tenantId);
  await fetch('/api/auth/tenant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId }),
  });
}

export type OnboardingProgress = {
  currentStep: string;
  completedSteps: string[];
  isComplete: boolean;
};

export type SetupStatus = {
  hasCatalog: boolean;
  hasOrders: boolean;
  productCount: number;
  orderCount: number;
};

export async function getOnboardingProgress(client: ApiClient): Promise<OnboardingProgress> {
  const res = await client.get<{ data: OnboardingProgress }>('/onboarding/progress');
  return res.data;
}

export async function getSetupStatus(client: ApiClient): Promise<SetupStatus> {
  const res = await client.get<{ data: SetupStatus }>('/onboarding/setup-status');
  return res.data;
}

export async function saveBusinessStep(
  client: ApiClient,
  body: {
    businessName: string;
    businessType?: string | null;
    currency: string;
    timezone: string;
  },
): Promise<OnboardingProgress> {
  const res = await client.post<{ data: OnboardingProgress }>('/onboarding/step/business', body);
  return res.data;
}

export async function saveLocationStep(
  client: ApiClient,
  body: {
    locationName: string;
    address?: string;
    phone?: string;
    pickupEnabled?: boolean;
    deliveryEnabled?: boolean;
  },
): Promise<OnboardingProgress> {
  const res = await client.post<{ data: OnboardingProgress }>('/onboarding/step/location', body);
  return res.data;
}

export async function saveCatalogStep(
  client: ApiClient,
  body: { firstItem?: { categoryName: string; itemName: string; price: string } },
): Promise<OnboardingProgress> {
  const res = await client.post<{ data: OnboardingProgress }>('/onboarding/step/catalog', body);
  return res.data;
}

export async function importSampleCatalog(client: ApiClient): Promise<unknown> {
  const res = await client.post<{ data: unknown }>('/onboarding/catalog/init-sample', {});
  return res.data;
}

export async function saveBrandingStep(
  client: ApiClient,
  body: {
    logoUrl?: string;
    primaryColor?: string;
    receiptHeader?: string;
    receiptFooter?: string;
  },
): Promise<OnboardingProgress> {
  const res = await client.post<{ data: OnboardingProgress }>('/onboarding/step/branding', body);
  return res.data;
}

export async function completePaymentsStep(client: ApiClient): Promise<OnboardingProgress> {
  const res = await client.post<{ data: OnboardingProgress }>('/onboarding/step/payments', {});
  return res.data;
}

export async function finalizeOnboarding(client: ApiClient): Promise<OnboardingProgress> {
  const res = await client.post<{ data: OnboardingProgress }>('/onboarding/complete', {});
  return res.data;
}
