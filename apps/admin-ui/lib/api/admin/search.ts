import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const searchResultSchema = z.object({
  entityType: z.string(),
  entityId: z.string().uuid(),
  title: z.string(),
  body: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).default({}),
  relevance: z.number().optional(),
  semanticScore: z.number().optional(),
});

const searchResponseSchema = z.object({
  results: z.array(searchResultSchema),
  total: z.number(),
  query: z.string(),
  generatedAt: z.string(),
});

export type AdminSearchResult = z.infer<typeof searchResultSchema>;
export type AdminSearchResponse = z.infer<typeof searchResponseSchema>;

export async function searchIndex(
  api: ApiClient,
  params: {
    q?: string;
    entityType?: string;
    locationId?: string;
    categoryId?: string;
    supplierId?: string;
    priceMin?: number;
    priceMax?: number;
    inStockOnly?: boolean;
    dateRange?: string;
    sort?: 'relevance' | 'price' | 'name' | 'popularity';
    semantic?: boolean;
    limit?: number;
  },
) {
  const path = params.semantic ? 'search/semantic' : 'search';
  const data = await api.getData<unknown>(path, {
    params: {
      q: params.q,
      entityType: params.entityType || undefined,
      locationId: params.locationId || undefined,
      categoryId: params.categoryId || undefined,
      supplierId: params.supplierId || undefined,
      priceMin: params.priceMin,
      priceMax: params.priceMax,
      inStockOnly: params.inStockOnly,
      dateRange: params.dateRange || undefined,
      sort: params.sort,
      limit: params.limit ?? 50,
    },
  });
  return searchResponseSchema.parse(data);
}

export async function reindexSearch(api: ApiClient, entityType?: string) {
  return api.postData<unknown>('search/reindex', { entityType: entityType || undefined });
}
