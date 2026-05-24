import type { TokenStorage } from './storage';

export function getAuthHeaders(storage: TokenStorage): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = storage.getAccessToken();
  const tenantId = storage.getTenantId();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (tenantId) {
    headers['X-Tenant-Id'] = tenantId;
  }

  return headers;
}

export function isAuthenticated(storage: TokenStorage): boolean {
  return Boolean(storage.getAccessToken());
}

export function parseJwtPayload<T extends Record<string, unknown> = Record<string, unknown>>(
  token: string,
): T | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}
