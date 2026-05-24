export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
}

export function getTenantId(): string {
  return process.env.NEXT_PUBLIC_TENANT_ID ?? '';
}

export function getStorefrontUrl(): string {
  return process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:3003';
}

export function getBrandName(): string {
  return process.env.NEXT_PUBLIC_BRAND_NAME ?? 'Ordella';
}
