import type { ApiClient } from '@shared-utils';
import { catalogItemSchema, categorySchema } from '@shared-utils';
import { z } from 'zod';

export type CatalogCategory = z.infer<typeof categorySchema>;
export type CatalogItem = z.infer<typeof catalogItemSchema>;

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
