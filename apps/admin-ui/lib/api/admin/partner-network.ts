import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const partnerApplicationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  appPartnerId: z.string().uuid(),
  status: z.string(),
  submittedAt: z.string(),
  metadata: z.record(z.unknown()).optional().default({}),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const partnerMarketplaceCategorySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  categoryKey: z.string(),
  displayName: z.string(),
  isGlobal: z.boolean(),
  metadata: z.record(z.unknown()).optional().default({}),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const partnerMarketplaceItemSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  appPartnerId: z.string().uuid(),
  categoryId: z.string().uuid().nullable().optional(),
  itemType: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().default(''),
  status: z.string(),
  regionCodes: z.array(z.string()).optional().default([]),
  linkedAppId: z.string().uuid().nullable().optional(),
  metadata: z.record(z.unknown()).optional().default({}),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type PartnerApplication = z.infer<typeof partnerApplicationSchema>;
export type PartnerMarketplaceCategory = z.infer<typeof partnerMarketplaceCategorySchema>;
export type PartnerMarketplaceItem = z.infer<typeof partnerMarketplaceItemSchema>;

export async function listPartnerApplications(
  api: ApiClient,
  params?: { status?: string },
): Promise<PartnerApplication[]> {
  return partnerApplicationSchema.array().parse(await api.getData<unknown[]>('partner-network/applications', { params }));
}

export async function approvePartnerApplication(api: ApiClient, id: string, body: { status: 'approved' | 'rejected'; comment?: string }) {
  return partnerApplicationSchema.parse(await api.postData<unknown>(`partner-network/applications/${id}/approve`, body));
}

export async function listMarketplaceCategories(api: ApiClient): Promise<PartnerMarketplaceCategory[]> {
  return partnerMarketplaceCategorySchema.array().parse(await api.getData<unknown[]>('partner-network/marketplace/categories'));
}

export async function listMarketplaceItems(
  api: ApiClient,
  query?: { regionCode?: string; itemType?: 'integration' | 'automation' | 'hardware_bundle' },
): Promise<PartnerMarketplaceItem[]> {
  return partnerMarketplaceItemSchema.array().parse(await api.getData<unknown[]>('partner-network/marketplace/items', { params: query }));
}

