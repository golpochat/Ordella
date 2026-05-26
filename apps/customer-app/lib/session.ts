import { createBrowserTokenStorage } from '@shared-utils';

const CUSTOMER_ID_KEY = 'ordella.customerId';
const CUSTOMER_NAME_KEY = 'ordella.customerName';
export const CUSTOMER_SESSION_CHANGED_EVENT = 'ordella:customer-session-changed';

export const tokenStorage = createBrowserTokenStorage();

type CustomerJwtPayload = {
  type?: string;
  exp?: number;
};

function decodeJwtPayload(token: string): CustomerJwtPayload | null {
  if (typeof window === 'undefined') return null;

  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return JSON.parse(window.atob(padded)) as CustomerJwtPayload;
  } catch {
    return null;
  }
}

function isValidCustomerToken(token: string | null | undefined): token is string {
  const trimmed = token?.trim();
  if (!trimmed) return false;

  const payload = decodeJwtPayload(trimmed);
  if (payload?.type !== 'customer') return false;
  if (payload.exp && payload.exp * 1000 <= Date.now()) return false;
  return true;
}

export function getCustomerAccessToken(): string | null {
  const token = tokenStorage.getAccessToken();
  if (!isValidCustomerToken(token)) {
    return null;
  }
  return token.trim();
}

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
  return Boolean(getCustomerAccessToken() && tokenStorage.getTenantId()?.trim());
}

export function clearCustomerSession(): void {
  tokenStorage.clear();
  setCustomerId(null);
  setCustomerName('');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CUSTOMER_SESSION_CHANGED_EVENT));
  }
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
