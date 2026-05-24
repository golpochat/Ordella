export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
}

export function getSocketBaseUrl(): string {
  return getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
}

export function getTenantId(): string {
  return process.env.NEXT_PUBLIC_TENANT_ID ?? '';
}

export function getLocationId(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('ordella.locationId');
    if (stored) {
      return stored;
    }
  }
  return process.env.NEXT_PUBLIC_LOCATION_ID ?? '';
}

export function getLocationName(): string {
  return process.env.NEXT_PUBLIC_LOCATION_NAME ?? 'Location';
}
