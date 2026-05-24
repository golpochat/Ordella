export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
}

export function getTenantId(): string {
  return process.env.NEXT_PUBLIC_TENANT_ID ?? '';
}

export function getDefaultDriverId(): string {
  return process.env.NEXT_PUBLIC_DRIVER_ID ?? '';
}

export function getDefaultAccessToken(): string {
  return process.env.NEXT_PUBLIC_ACCESS_TOKEN ?? '';
}

export function getPickupName(): string {
  return process.env.NEXT_PUBLIC_PICKUP_NAME ?? 'Pickup location';
}

export function getPickupAddress(): string {
  return process.env.NEXT_PUBLIC_PICKUP_ADDRESS ?? '';
}
