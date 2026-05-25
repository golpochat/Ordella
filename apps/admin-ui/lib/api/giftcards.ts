import { createBrowserApiClient } from './browser';

export type GiftCard = {
  id: string;
  tenantId: string;
  code: string;
  initialValue: string;
  balance: string;
  currency: string;
  customerId: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  customer?: { id: string; name: string; email: string | null; phone: string | null } | null;
  transactions?: GiftCardTransaction[];
};

export type GiftCardTransaction = {
  id: string;
  giftCardId: string;
  amount: string;
  type: 'issue' | 'redeem' | 'refund' | 'adjustment';
  orderId: string | null;
  createdAt: string;
};

export type StoreCreditTransaction = {
  id: string;
  customerId: string;
  tenantId: string;
  amount: string;
  type: 'refund' | 'adjustment' | 'compensation' | 'redeem';
  orderId: string | null;
  createdAt: string;
};

export type GiftCardAnalytics = {
  giftCardSales: string;
  giftCardRedemptions: string;
  outstandingLiability: string;
  storeCreditIssued: string;
  storeCreditRedeemed: string;
};

export async function listGiftCards(): Promise<GiftCard[]> {
  return createBrowserApiClient().getData<GiftCard[]>('giftcards/list');
}

export async function createGiftCard(body: {
  initialValue: number;
  currency?: string;
  customerId?: string;
  expiresAt?: string;
  code?: string;
}): Promise<GiftCard> {
  return createBrowserApiClient().postData<GiftCard>('giftcards/create', body);
}

export async function adjustGiftCard(body: { giftCardId: string; amount: number }): Promise<GiftCard> {
  return createBrowserApiClient().postData<GiftCard>('giftcards/adjust', body);
}

export async function setGiftCardStatus(body: { giftCardId: string; isActive: boolean }): Promise<GiftCard> {
  return createBrowserApiClient().postData<GiftCard>('giftcards/status', body);
}

export async function lookupGiftCard(code: string): Promise<GiftCard> {
  return createBrowserApiClient().getData<GiftCard>(`giftcards/lookup?code=${encodeURIComponent(code)}`);
}

export async function addStoreCredit(body: {
  customerId: string;
  amount: number;
  type?: 'refund' | 'adjustment' | 'compensation';
  orderId?: string;
}): Promise<StoreCreditTransaction> {
  return createBrowserApiClient().postData<StoreCreditTransaction>('storecredit/add', body);
}

export async function deductStoreCredit(body: {
  customerId: string;
  amount: number;
  orderId?: string;
}): Promise<StoreCreditTransaction> {
  return createBrowserApiClient().postData<StoreCreditTransaction>('storecredit/deduct', body);
}

export async function listStoreCreditHistory(customerId: string): Promise<StoreCreditTransaction[]> {
  return createBrowserApiClient().getData<StoreCreditTransaction[]>(
    `storecredit/history?customerId=${encodeURIComponent(customerId)}`,
  );
}

export async function getGiftCardAnalytics(): Promise<GiftCardAnalytics> {
  return createBrowserApiClient().getData<GiftCardAnalytics>('giftcards/analytics');
}
