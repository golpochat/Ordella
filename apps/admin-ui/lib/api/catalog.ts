import type { ApiClient } from '@shared-utils';
import { catalogItemSchema, categorySchema } from '@shared-utils';
import { z } from 'zod';

export type CatalogCategory = z.infer<typeof categorySchema>;
export type CatalogItem = z.infer<typeof catalogItemSchema>;

const bundleItemSchema = z.object({
  id: z.string().uuid().optional(),
  bundleId: z.string().uuid().optional(),
  itemId: z.string().uuid(),
  quantity: z.number().int(),
  isOptional: z.boolean(),
  minSelect: z.number().int().nullable().optional(),
  maxSelect: z.number().int().nullable().optional(),
});

export const catalogBundleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  priceType: z.enum(['fixed', 'discounted', 'dynamic']),
  fixedPrice: z.string().nullable().optional(),
  discountAmount: z.string().nullable().optional(),
  discountPercent: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  items: z.array(bundleItemSchema).default([]),
});

export type CatalogBundle = z.infer<typeof catalogBundleSchema>;

export async function listCatalogCategories(api: ApiClient): Promise<CatalogCategory[]> {
  const data = await api.getData<unknown[]>('catalog/categories');
  return z.array(categorySchema).parse(data);
}

export async function createCatalogCategory(
  api: ApiClient,
  body: { name: string; description?: string; sortOrder?: number; isActive?: boolean },
) {
  const data = await api.postData<unknown>('catalog/category/create', body);
  return categorySchema.parse(data);
}

export async function updateCatalogCategory(
  api: ApiClient,
  body: {
    id: string;
    name?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  },
) {
  const data = await api.postData<unknown>('catalog/category/update', body);
  return categorySchema.parse(data);
}

export async function deleteCatalogCategory(api: ApiClient, id: string) {
  await api.postData('catalog/category/delete', { id });
}

export async function listCatalogItems(
  api: ApiClient,
  params?: { categoryId?: string; channel?: string },
): Promise<CatalogItem[]> {
  const data = await api.getData<unknown[]>('catalog/items', { params });
  return z.array(catalogItemSchema).parse(data);
}

export async function createCatalogItem(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('catalog/item/create', body);
  return catalogItemSchema.parse(data);
}

export async function updateCatalogItem(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('catalog/item/update', body);
  return catalogItemSchema.parse(data);
}

export async function deleteCatalogItem(api: ApiClient, id: string) {
  await api.postData('catalog/item/delete', { id });
}

export async function uploadCatalogItemImage(
  api: ApiClient,
  itemId: string,
  imageUrl: string,
) {
  const data = await api.postData<unknown>('catalog/item/upload-image', { itemId, imageUrl });
  return catalogItemSchema.parse(data);
}

export async function addCatalogVariant(
  api: ApiClient,
  body: { itemId: string; name: string; priceDelta?: string; sku?: string },
) {
  const data = await api.postData<unknown>('catalog/item/add-variant', body);
  return data;
}

export async function addCatalogModifier(
  api: ApiClient,
  body: {
    itemId: string;
    name: string;
    required?: boolean;
    options?: Array<{ name: string; priceDelta?: string }>;
  },
) {
  const data = await api.postData<unknown>('catalog/item/add-modifier', body);
  return catalogItemSchema.parse(data);
}

export async function listCatalogBundles(api: ApiClient): Promise<CatalogBundle[]> {
  const data = await api.getData<unknown[]>('bundles/list');
  return z.array(catalogBundleSchema).parse(data);
}

export async function createCatalogBundle(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('bundles/create', body);
  return catalogBundleSchema.parse(data);
}

export async function updateCatalogBundle(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('bundles/update', body);
  return catalogBundleSchema.parse(data);
}

export async function duplicateCatalogBundle(api: ApiClient, id: string) {
  const data = await api.postData<unknown>(`bundles/${id}/duplicate`, {});
  return catalogBundleSchema.parse(data);
}

export async function disableCatalogBundle(api: ApiClient, id: string) {
  const data = await api.postData<unknown>(`bundles/${id}/disable`, {});
  return catalogBundleSchema.parse(data);
}

export async function deleteCatalogBundle(api: ApiClient, id: string) {
  await api.postData('bundles/delete', { id });
}
