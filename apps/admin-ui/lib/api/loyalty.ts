import { createBrowserApiClient } from './browser';

export type LoyaltySettings = {
  tenantId: string;
  isEnabled: boolean;
  earnRate: string;
  redeemRate: string;
  autoEnroll: boolean;
  minRedeemPoints: number;
  maxRedeemPercent: number;
};

export type LoyaltyCustomer = {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  phone: string | null;
  pointsBalance: number;
  storeCreditBalance: string;
  lifetimeValue: string;
  lastOrderAt: string | null;
  createdAt: string;
  transactions?: LoyaltyTransaction[];
};

export type LoyaltyTransaction = {
  id: string;
  tenantId: string;
  customerId: string;
  points: number;
  type: 'earn' | 'redeem' | 'adjustment';
  orderId: string | null;
  createdAt: string;
  customer?: LoyaltyCustomer;
};

export type LoyaltyAnalytics = {
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  breakage: number;
  customerCount: number;
  repeatOrderRate: number;
  customerLifetimeValue: string;
  topLoyalCustomers: LoyaltyCustomer[];
};

export async function getLoyaltySettings(): Promise<LoyaltySettings> {
  return createBrowserApiClient().getData<LoyaltySettings>('loyalty/settings');
}

export async function updateLoyaltySettings(body: Partial<{
  isEnabled: boolean;
  earnRate: number;
  redeemRate: number;
  autoEnroll: boolean;
  minRedeemPoints: number;
  maxRedeemPercent: number;
}>): Promise<LoyaltySettings> {
  return createBrowserApiClient().postData<LoyaltySettings>('loyalty/settings', body);
}

export async function listLoyaltyTransactions(params: Record<string, string> = {}): Promise<LoyaltyTransaction[]> {
  const query = new URLSearchParams(params).toString();
  return createBrowserApiClient().getData<LoyaltyTransaction[]>(`loyalty/transactions${query ? `?${query}` : ''}`);
}

export async function searchLoyaltyCustomers(q = ''): Promise<LoyaltyCustomer[]> {
  const query = q ? `?q=${encodeURIComponent(q)}` : '';
  return createBrowserApiClient().getData<LoyaltyCustomer[]>(`loyalty/customers${query}`);
}

export async function getLoyaltyCustomer(id: string): Promise<LoyaltyCustomer> {
  return createBrowserApiClient().getData<LoyaltyCustomer>(`loyalty/customers/${id}`);
}

export async function adjustLoyaltyPoints(body: { customerId: string; points: number; reason?: string }): Promise<LoyaltyTransaction> {
  return createBrowserApiClient().postData<LoyaltyTransaction>('loyalty/adjust', body);
}

export async function getLoyaltyAnalytics(): Promise<LoyaltyAnalytics> {
  return createBrowserApiClient().getData<LoyaltyAnalytics>('loyalty/analytics');
}
