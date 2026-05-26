const DEMO_TENANT_ID = 'bella-kitchen';
const DEMO_LOCATION_ID = '20000000-0000-4000-8000-000000000001';
const DEMO_KDS_EMAIL = 'staff@bella-kitchen.test';
const DEMO_KDS_PASSWORD = 'BellaStaff!2026';
const KDS_ACCESS_TOKEN_KEY = 'ordella.kds.accessToken';
const KDS_EMAIL_KEY = 'ordella.kds.email';
const KDS_PASSWORD_KEY = 'ordella.kds.password';
const TENANT_ID_KEY = 'ordella.tenantId';
const LOCATION_ID_KEY = 'ordella.locationId';

function isPlaceholder(value: string | null | undefined): boolean {
  const trimmed = value?.trim();
  return !trimmed || (trimmed.startsWith('<') && trimmed.endsWith('>'));
}

function configuredValue(value: string | null | undefined, fallback = ''): string {
  return isPlaceholder(value) ? fallback : value!.trim();
}

function readStorage(key: string): string {
  if (typeof window === 'undefined') return '';
  return configuredValue(window.localStorage.getItem(key));
}

function writeStorage(key: string, value: string | null): void {
  if (typeof window === 'undefined' || isPlaceholder(value)) return;
  window.localStorage.setItem(key, value!.trim());
}

function readQueryParam(name: string): string {
  if (typeof window === 'undefined') return '';
  return configuredValue(new URLSearchParams(window.location.search).get(name));
}

export function bootstrapKdsRuntimeConfig(): void {
  const tenantId = readQueryParam('tenantId');
  const locationId = readQueryParam('locationId');
  const accessToken = readQueryParam('accessToken');
  const email = readQueryParam('kdsEmail');
  const password = readQueryParam('kdsPassword');
  if (tenantId) writeStorage(TENANT_ID_KEY, tenantId);
  if (locationId) writeStorage(LOCATION_ID_KEY, locationId);
  if (accessToken) writeStorage(KDS_ACCESS_TOKEN_KEY, accessToken);
  if (email) writeStorage(KDS_EMAIL_KEY, email);
  if (password) writeStorage(KDS_PASSWORD_KEY, password);
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
}

export function getSocketBaseUrl(): string {
  return getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
}

export function getTenantId(): string {
  return (
    readQueryParam('tenantId') ||
    readStorage(TENANT_ID_KEY) ||
    configuredValue(process.env.NEXT_PUBLIC_TENANT_ID, DEMO_TENANT_ID)
  );
}

export function getLocationId(): string {
  const query = readQueryParam('locationId');
  if (query) return query;
  if (typeof window !== 'undefined') {
    const stored = readStorage(LOCATION_ID_KEY);
    if (stored) {
      return stored;
    }
  }
  return configuredValue(process.env.NEXT_PUBLIC_LOCATION_ID, DEMO_LOCATION_ID);
}

export function getLocationName(): string {
  return process.env.NEXT_PUBLIC_LOCATION_NAME ?? 'Location';
}

export function getAccessToken(): string | null {
  const query = readQueryParam('accessToken');
  if (query) return query;
  const stored = readStorage(KDS_ACCESS_TOKEN_KEY);
  if (stored) return stored;
  return (
    configuredValue(process.env.NEXT_PUBLIC_KDS_ACCESS_TOKEN) ||
    null
  );
}

export function getStoredKdsAccessToken(): string {
  return readStorage(KDS_ACCESS_TOKEN_KEY);
}

export function setKdsAccessToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (isPlaceholder(token)) {
    window.localStorage.removeItem(KDS_ACCESS_TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(KDS_ACCESS_TOKEN_KEY, token!.trim());
}

export function clearKdsAccessToken(): void {
  setKdsAccessToken(null);
}

export function getKdsCredentials(): { email: string; password: string } | null {
  const email =
    readQueryParam('kdsEmail') ||
    readStorage(KDS_EMAIL_KEY) ||
    configuredValue(process.env.NEXT_PUBLIC_KDS_EMAIL);
  const password =
    readQueryParam('kdsPassword') ||
    readStorage(KDS_PASSWORD_KEY) ||
    configuredValue(process.env.NEXT_PUBLIC_KDS_PASSWORD);

  if (email && password) return { email, password };
  if (getTenantId() === DEMO_TENANT_ID) {
    return { email: DEMO_KDS_EMAIL, password: DEMO_KDS_PASSWORD };
  }
  return null;
}

export function getStoredKdsCredentials(): { email: string; password: string } {
  return {
    email: readStorage(KDS_EMAIL_KEY),
    password: readStorage(KDS_PASSWORD_KEY),
  };
}

export function setKdsCredentials(email: string, password: string): void {
  writeStorage(KDS_EMAIL_KEY, email);
  writeStorage(KDS_PASSWORD_KEY, password);
}
