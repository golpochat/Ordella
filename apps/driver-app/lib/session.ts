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
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(ACTIVE_TASK_KEY);
}

export function hasValidSession(session: DriverSession): boolean {
  return Boolean(session.driverId && session.tenantId && session.accessToken);
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
