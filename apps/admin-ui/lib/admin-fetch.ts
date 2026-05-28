import { createBrowserApiClient } from '@/lib/api/browser';

/** SWR fetcher with request dedupe via SWR; supports AbortSignal when key is object. */
export async function adminFetcher<T>(key: string): Promise<T> {
  const response = await fetch(key, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

/** Pass-through fetcher for useSWR keys that are custom async functions. */
export type AdminQueryFn<T> = () => Promise<T>;

export function getAdminApiClient() {
  return createBrowserApiClient();
}
