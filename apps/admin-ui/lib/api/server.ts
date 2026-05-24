import { cookies } from 'next/headers';
import { createApiClient } from '@shared-utils';
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_TENANT } from '@/lib/auth/constants';
import { getApiBaseUrl } from './config';

export function createServerApiClient() {
  const cookieStore = cookies();

  return createApiClient({
    baseUrl: getApiBaseUrl(),
    getAccessToken: () => cookieStore.get(AUTH_COOKIE_ACCESS)?.value ?? null,
    getTenantId: () => cookieStore.get(AUTH_COOKIE_TENANT)?.value ?? null,
  });
}
