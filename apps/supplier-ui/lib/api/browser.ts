'use client';

import { createApiClient, createBrowserTokenStorage } from '@shared-utils';
import { getApiBaseUrl } from './config';

const storage = createBrowserTokenStorage();

export function createBrowserApiClient() {
  return createApiClient({
    baseUrl: getApiBaseUrl(),
    getAccessToken: () => storage.getAccessToken(),
    getTenantId: () => storage.getTenantId(),
  });
}

export { storage as browserTokenStorage };
