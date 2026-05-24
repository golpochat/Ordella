import { createApiClient } from '@shared-utils';
import { z } from 'zod';

const locationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string().nullable().optional(),
});

export async function fetchPosLocations() {
  const api = createApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
    getAccessToken: () =>
      typeof window === 'undefined' ? null : localStorage.getItem('ordella.accessToken'),
    getTenantId: () =>
      typeof window === 'undefined' ? null : localStorage.getItem('ordella.tenantId'),
  });
  const data = await api.getData<unknown[]>('locations/list');
  return z.array(locationSchema).parse(data);
}
