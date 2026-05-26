export type DriverStatus = 'available' | 'busy' | 'offline';

export type DriverSession = {
  driverId: string;
  driverName: string;
  tenantId: string;
  accessToken: string;
  status: DriverStatus;
};

const STORAGE_KEY = 'ordella.driver.session';
const ACTIVE_TASK_KEY = 'ordella.driver.activeTaskId';
export const DRIVER_SESSION_CHANGED_EVENT = 'ordella:driver-session-changed';

type DriverJwtPayload = {
  sub?: string;
  exp?: number;
  type?: string;
};

function decodeJwtPayload(token: string): DriverJwtPayload | null {
  if (typeof window === 'undefined') return null;

  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return JSON.parse(window.atob(padded)) as DriverJwtPayload;
  } catch {
    return null;
  }
}

function isValidAccessToken(token: string | null | undefined): token is string {
  const trimmed = token?.trim();
  if (!trimmed) return false;

  const payload = decodeJwtPayload(trimmed);
  if (!payload?.sub) return false;
  if (payload.type === 'customer' || payload.type === 'refresh' || payload.type === 'sso_state') {
    return false;
  }
  if (payload.exp && payload.exp * 1000 <= Date.now()) return false;
  return true;
}

export function statusLabel(status: DriverStatus): string {
  const labels: Record<DriverStatus, string> = {
    available: 'Available',
    busy: 'Busy',
    offline: 'Offline',
  };
  return labels[status];
}

export function getSession(): DriverSession {
  if (typeof window === 'undefined') {
    return emptySession();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return hydrateFromEnv();
  }

  try {
    return { ...emptySession(), ...(JSON.parse(raw) as DriverSession) };
  } catch {
    return emptySession();
  }
}

export function setSession(session: DriverSession): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(DRIVER_SESSION_CHANGED_EVENT));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(ACTIVE_TASK_KEY);
  window.localStorage.removeItem('ordella.accessToken');
  window.localStorage.removeItem('ordella.tenantId');
  window.dispatchEvent(new Event(DRIVER_SESSION_CHANGED_EVENT));
}

export function hasValidSession(session: DriverSession): boolean {
  return Boolean(session.driverId && session.tenantId && getDriverAccessToken(session));
}

export function getDriverAccessToken(session: DriverSession = getSession()): string | null {
  return isValidAccessToken(session.accessToken) ? session.accessToken.trim() : null;
}

export function getActiveTaskId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACTIVE_TASK_KEY);
}

export function setActiveTaskId(taskId: string | null): void {
  if (typeof window === 'undefined') return;
  if (!taskId) {
    window.localStorage.removeItem(ACTIVE_TASK_KEY);
    return;
  }
  window.localStorage.setItem(ACTIVE_TASK_KEY, taskId);
}

function emptySession(): DriverSession {
  return {
    driverId: '',
    driverName: '',
    tenantId: '',
    accessToken: '',
    status: 'offline',
  };
}

function hydrateFromEnv(): DriverSession {
  return {
    driverId: process.env.NEXT_PUBLIC_DRIVER_ID ?? '',
    driverName: 'Driver',
    tenantId: process.env.NEXT_PUBLIC_TENANT_ID ?? '',
    accessToken: process.env.NEXT_PUBLIC_ACCESS_TOKEN ?? '',
    status: 'available',
  };
}
