import type { ApiClient } from '@shared-utils';
import { catalogItemSchema } from '@shared-utils';
import { z } from 'zod';

const globalCategorySchema = z.object({
  id: z.string().uuid(),
  brandGroupId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number(),
});

const globalItemSchema = z.object({
  id: z.string().uuid(),
  brandGroupId: z.string().uuid(),
  globalCategoryId: z.string().uuid().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  basePrice: z.string(),
  sku: z.string().nullable(),
  barcode: z.string().nullable(),
  taxCategoryId: z.string().uuid().nullable(),
  imageUrl: z.string().nullable(),
  attributes: z.record(z.unknown()).default({}),
  isActive: z.boolean(),
  localItemId: z.string().uuid().nullable().optional(),
  overrideUsage: z.number().optional(),
});

export type BrandGlobalCategory = z.infer<typeof globalCategorySchema>;
export type BrandGlobalItem = z.infer<typeof globalItemSchema>;
export type BrandLocalItem = z.infer<typeof catalogItemSchema>;

export async function listGlobalCatalogItems(api: ApiClient) {
  const data = await api.getData<unknown[]>('catalog/global');
  return z.array(globalItemSchema).parse(data);
}

export async function createGlobalCatalogItem(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('catalog/global/create', body);
  return globalItemSchema.parse(data);
}

export async function updateGlobalCatalogItem(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('catalog/global/update', body);
  return globalItemSchema.parse(data);
}

export async function listGlobalCatalogCategories(api: ApiClient) {
  const data = await api.getData<unknown[]>('catalog/categories/global');
  return z.array(globalCategorySchema).parse(data);
}

export async function createGlobalCatalogCategory(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('catalog/categories/global/create', body);
  return globalCategorySchema.parse(data);
}

export async function listLocalBrandCatalog(api: ApiClient) {
  const data = await api.getData<unknown[]>('catalog/local');
  return z.array(catalogItemSchema).parse(data);
}

export async function overrideLocalBrandItem(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('catalog/local/override', body);
  return catalogItemSchema.parse(data);
}

export async function resetLocalBrandOverride(api: ApiClient, localItemId: string) {
  const data = await api.postData<unknown>('catalog/local/reset-override', { localItemId });
  return catalogItemSchema.parse(data);
}
