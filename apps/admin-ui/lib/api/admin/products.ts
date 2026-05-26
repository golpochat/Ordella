import type { ApiClient } from '@shared-utils';
import { categorySchema, productSchema } from '@shared-utils';
import { z } from 'zod';

const modifierOptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  priceDelta: z.string().optional(),
});

const modifierSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  required: z.boolean().optional(),
  options: z.array(modifierOptionSchema).optional(),
});

export type AdminModifier = z.infer<typeof modifierSchema>;

export async function listProducts(
  api: ApiClient,
  params?: { status?: string; categoryId?: string; search?: string },
) {
  const data = await api.getData<unknown[]>('admin/products', { params });
  return z.array(productSchema).parse(data);
}

export async function createProduct(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('admin/products', body);
  return productSchema.parse(data);
}

export async function updateProduct(
  api: ApiClient,
  productId: string,
  body: Record<string, unknown>,
) {
  const data = await api.patch< { success: boolean; data: unknown }>(
    `admin/products/${productId}`,
    body,
  );
  return productSchema.parse(data.data);
}

export async function archiveProduct(api: ApiClient, productId: string) {
  const data = await api.postData<unknown>(`admin/products/${productId}/archive`);
  return productSchema.parse(data);
}

export async function listCategories(api: ApiClient) {
  const data = await api.getData<unknown[]>('admin/products/categories/list');
  return z.array(categorySchema).parse(data);
}

export async function createCategory(api: ApiClient, body: { name: string; sortOrder?: number; taxCategoryId?: string }) {
  const data = await api.postData<unknown>('admin/products/categories', body);
  return categorySchema.parse(data);
}

export async function listModifiers(api: ApiClient) {
  const data = await api.getData<unknown[]>('admin/products/modifiers/list');
  return z.array(modifierSchema).parse(data);
}

export async function createModifier(
  api: ApiClient,
  body: { name: string; required?: boolean },
) {
  const data = await api.postData<unknown>('admin/products/modifiers', body);
  return modifierSchema.parse(data);
}

export async function addModifierOption(
  api: ApiClient,
  modifierId: string,
  body: { name: string; priceDelta?: string },
) {
  const data = await api.postData<unknown>(`admin/products/modifiers/${modifierId}/options`, body);
  return modifierOptionSchema.parse(data);
}
