import { createBrowserTokenStorage } from '@shared-utils';

const CUSTOMER_ID_KEY = 'ordella.customerId';
const CUSTOMER_NAME_KEY = 'ordella.customerName';

export const tokenStorage = createBrowserTokenStorage();

export function getCustomerId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(CUSTOMER_ID_KEY);
}

export function setCustomerId(customerId: string | null): void {
  if (typeof window === 'undefined') return;
  if (!customerId) {
    window.localStorage.removeItem(CUSTOMER_ID_KEY);
    return;
  }
  window.localStorage.setItem(CUSTOMER_ID_KEY, customerId);
}

export function getCustomerName(): string {
  if (typeof window === 'undefined') return 'Guest';
  return window.localStorage.getItem(CUSTOMER_NAME_KEY) ?? 'Guest';
}

export function setCustomerName(name: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CUSTOMER_NAME_KEY, name);
}

export function hasCustomerSession(): boolean {
  return Boolean(tokenStorage.getAccessToken() && tokenStorage.getTenantId());
}

export function clearCustomerSession(): void {
  tokenStorage.clear();
  setCustomerId(null);
  setCustomerName('');
}

const LAST_ORDER_KEY = 'ordella.customer.lastOrderId';

export function getLastOrderId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LAST_ORDER_KEY);
}

export function setLastOrderId(orderId: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LAST_ORDER_KEY, orderId);
}
