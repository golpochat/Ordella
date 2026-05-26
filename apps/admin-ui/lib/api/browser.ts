'use client';

import { ApiError, createApiClient, createBrowserTokenStorage } from '@shared-utils';
import { getApiBaseUrl } from './config';

const storage = createBrowserTokenStorage();
export const ADMIN_SESSION_CHANGED_EVENT = 'ordella:admin-session-changed';

type AdminJwtPayload = {
  sub?: string;
  email?: string;
  exp?: number;
  type?: string;
};

function decodeJwtPayload(token: string): AdminJwtPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return JSON.parse(window.atob(padded)) as AdminJwtPayload;
  } catch {
    return null;
  }
}

function isValidAdminAccessToken(token: string | null | undefined): token is string {
  const trimmed = token?.trim();
  if (!trimmed || typeof window === 'undefined') return false;

  const payload = decodeJwtPayload(trimmed);
  if (!payload?.sub) return false;
  if (payload.type === 'customer' || payload.type === 'refresh' || payload.type === 'sso_state') {
    return false;
  }
  if (payload.exp && payload.exp * 1000 <= Date.now()) return false;
  return true;
}

export function getAdminAccessToken(): string | null {
  const token = storage.getAccessToken();
  return isValidAdminAccessToken(token) ? token.trim() : null;
}

export function getAdminUserLabel(): string {
  const token = getAdminAccessToken();
  const payload = token ? decodeJwtPayload(token) : null;
  return payload?.email ?? payload?.sub ?? 'Admin';
}

export async function clearBrowserAuthSession(options: { redirectToLogin?: boolean } = {}) {
  storage.clear();
  window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT));
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);

  if (options.redirectToLogin && window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
}

async function withAuthRedirect<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      void clearBrowserAuthSession({ redirectToLogin: true });
    }
    throw error;
  }
}

export function createBrowserApiClient() {
  const api = createApiClient({
    baseUrl: getApiBaseUrl(),
    getAccessToken: () => getAdminAccessToken(),
    getTenantId: () => storage.getTenantId(),
  });

  return new Proxy(api, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') return value;
      return (...args: never[]) => withAuthRedirect(value.apply(target, args));
    },
  }) as typeof api;
}

export { storage as browserTokenStorage };
