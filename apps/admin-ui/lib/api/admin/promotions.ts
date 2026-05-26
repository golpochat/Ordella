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

const promotionPreviewSchema = z.object({
  discountTotal: z.string(),
  grandTotal: z.string(),
  projectedSubtotal: z.string(),
  projectedDiscountRate: z.number(),
  estimatedMarginImpact: z.string(),
  appliedPromotions: z.array(z.object({
    promotionId: z.string(),
    code: z.string().nullable().optional(),
    discountAmount: z.string(),
  })),
});

export type PromotionPreview = z.infer<typeof promotionPreviewSchema>;

export async function previewPromotion(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('admin/promotions/preview', body);
  return promotionPreviewSchema.parse(data);
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
