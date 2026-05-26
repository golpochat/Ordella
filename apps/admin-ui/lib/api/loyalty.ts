import { createBrowserApiClient } from './browser';

export type LoyaltySettings = {
  tenantId: string;
  isEnabled: boolean;
  earnRate: string;
  redeemRate: string;
  autoEnroll: boolean;
  minRedeemPoints: number;
  maxRedeemPercent: number;
  currency?: string | null;
  pointsExpireDays?: number | null;
  referralEnabled: boolean;
  referrerBonusPoints: number;
  refereeBonusPoints: number;
  maxDailyRedemptions: number;
  maxDailyReferrals: number;
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
  tier?: LoyaltyTier | null;
  availableRewards?: LoyaltyReward[];
  referral?: LoyaltyReferralSummary;
};

export type LoyaltyTransaction = {
  id: string;
  tenantId: string;
  customerId: string;
  points: number;
  pointsEarned?: number;
  pointsRedeemed?: number;
  source?: string;
  type: 'earn' | 'redeem' | 'adjustment' | 'referral' | 'promotion' | 'reversal';
  orderId: string | null;
  balanceAfter?: number;
  reason?: string | null;
  createdAt: string;
  customer?: LoyaltyCustomer;
};

export type LoyaltyTier = {
  id: string;
  name: string;
  pointsThreshold: number;
  spendThreshold: string;
  pointsMultiplier: string;
  discountPercent: string;
  perks: string[];
  sortOrder: number;
  isActive: boolean;
};

export type LoyaltyReward = {
  id: string;
  name: string;
  type: 'voucher' | 'discount' | 'free_item';
  pointsCost: number;
  discountAmount: string | null;
  discountPercent: string | null;
  freeItemId: string | null;
  tierNames: string[];
  expiresAt: string | null;
  isActive: boolean;
};

export type LoyaltyReferral = {
  id: string;
  referrerCustomerId: string;
  referredCustomerId: string | null;
  code: string;
  status: 'pending' | 'converted' | 'rewarded' | 'flagged';
  referrerBonusPoints: number;
  refereeBonusPoints: number;
  createdAt: string;
  referrer?: LoyaltyCustomer;
  referredCustomer?: LoyaltyCustomer | null;
};

export type LoyaltyReferralSummary = {
  code?: string;
  referralLink?: string | null;
  totalReferrals: number;
  rewardedReferrals: number;
  referrals: LoyaltyReferral[];
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
  currency: string;
  pointsExpireDays: number;
  referralEnabled: boolean;
  referrerBonusPoints: number;
  refereeBonusPoints: number;
  maxDailyRedemptions: number;
  maxDailyReferrals: number;
}>): Promise<LoyaltySettings> {
  return createBrowserApiClient().postData<LoyaltySettings>('loyalty/settings', body);
}

export async function listLoyaltyTiers(): Promise<LoyaltyTier[]> {
  return createBrowserApiClient().getData<LoyaltyTier[]>('loyalty/tiers');
}

export async function upsertLoyaltyTier(body: {
  id?: string;
  name: string;
  pointsThreshold: number;
  spendThreshold: number;
  pointsMultiplier: number;
  discountPercent?: number;
  perks?: string[];
  sortOrder?: number;
  isActive?: boolean;
}): Promise<LoyaltyTier> {
  return createBrowserApiClient().postData<LoyaltyTier>('loyalty/tiers', body);
}

export async function listLoyaltyRewards(): Promise<LoyaltyReward[]> {
  return createBrowserApiClient().getData<LoyaltyReward[]>('loyalty/rewards');
}

export async function upsertLoyaltyReward(body: {
  id?: string;
  name: string;
  type: LoyaltyReward['type'];
  pointsCost: number;
  discountAmount?: number;
  discountPercent?: number;
  freeItemId?: string;
  tierNames?: string[];
  isActive?: boolean;
}): Promise<LoyaltyReward> {
  return createBrowserApiClient().postData<LoyaltyReward>('loyalty/rewards', body);
}

export async function listLoyaltyReferrals(): Promise<LoyaltyReferral[]> {
  return createBrowserApiClient().getData<LoyaltyReferral[]>('loyalty/referrals');
}

export async function createLoyaltyReferral(body: {
  referrerCustomerId: string;
  referredCustomerId?: string;
  code?: string;
}): Promise<LoyaltyReferral> {
  return createBrowserApiClient().postData<LoyaltyReferral>('loyalty/referrals', body);
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
