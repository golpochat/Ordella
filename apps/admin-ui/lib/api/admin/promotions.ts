import type { ApiClient } from '@shared-utils';
import { promotionSchema } from '@shared-utils';
import { z } from 'zod';

export async function listPromotions(api: ApiClient) {
  const data = await api.getData<unknown[]>('admin/promotions');
  return z.array(promotionSchema).parse(data);
}

export async function createPromotion(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('admin/promotions', body);
  return promotionSchema.parse(data);
}

export async function updatePromotion(
  api: ApiClient,
  promotionId: string,
  body: Record<string, unknown>,
) {
  const data = await api.patch<{ success: boolean; data: unknown }>(
    `admin/promotions/${promotionId}`,
    body,
  );
  return promotionSchema.parse(data.data);
}

export async function activatePromotion(api: ApiClient, promotionId: string) {
  const data = await api.postData<unknown>(`admin/promotions/${promotionId}/activate`);
  return promotionSchema.parse(data);
}

export async function deactivatePromotion(api: ApiClient, promotionId: string) {
  const data = await api.postData<unknown>(`admin/promotions/${promotionId}/deactivate`);
  return promotionSchema.parse(data);
}

export async function duplicatePromotion(api: ApiClient, promotionId: string) {
  const data = await api.postData<unknown>(`admin/promotions/${promotionId}/duplicate`);
  return promotionSchema.parse(data);
}
