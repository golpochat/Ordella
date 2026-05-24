import { createApiClient } from '@shared-utils';
import { z } from 'zod';
import { getApiBaseUrl, getTenantId } from './config';

const api = createApiClient({
  baseUrl: getApiBaseUrl(),
  getAccessToken: () => null,
  getTenantId: () => getTenantId(),
});

const publicLocationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  address: z.string().nullable(),
  timezone: z.string(),
  currency: z.string(),
  phone: z.string(),
});

export type PublicLocation = z.infer<typeof publicLocationSchema>;

export async function fetchPublicLocations(): Promise<PublicLocation[]> {
  const data = await api.getData<unknown[]>('public/locations');
  return z.array(publicLocationSchema).parse(data);
}

export async function resolvePublicLocation(slugOrId: string): Promise<PublicLocation> {
  const data = await api.getData<unknown>(`public/locations/resolve/${encodeURIComponent(slugOrId)}`);
  return publicLocationSchema.parse(data);
}
