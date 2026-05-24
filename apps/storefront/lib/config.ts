export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
}

export function getTenantId(): string {
  return process.env.NEXT_PUBLIC_TENANT_ID ?? '';
}

export function getLocationId(): string {
  return process.env.NEXT_PUBLIC_LOCATION_ID ?? '';
}

export function getBrandName(): string {
  return process.env.NEXT_PUBLIC_BRAND_NAME ?? 'Ordella';
}

export function getOpeningHours(): string {
  return process.env.NEXT_PUBLIC_OPENING_HOURS ?? 'Hours vary by location';
}

export function getBusinessAddress(): string {
  return process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? '';
}
