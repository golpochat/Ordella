import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

export const taxRuleSchema = z.object({
  id: z.string(),
  locationId: z.string().nullable().optional(),
  country: z.string(),
  region: z.string().nullable().optional(),
  taxName: z.string(),
  taxRate: z.string(),
  taxType: z.enum(['vat', 'gst', 'sales_tax']),
  appliesTo: z.array(z.enum(['items', 'categories', 'delivery', 'service_fee'])),
  priceMode: z.enum(['inclusive', 'exclusive']),
  isDefault: z.boolean(),
  taxIdLabel: z.string().nullable().optional(),
  taxIdValue: z.string().nullable().optional(),
});

export const taxCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  defaultTaxRuleId: z.string().nullable(),
});

export type TaxRule = z.infer<typeof taxRuleSchema>;
export type TaxCategory = z.infer<typeof taxCategorySchema>;

export type TaxRulePayload = {
  id?: string;
  locationId?: string;
  country: string;
  region?: string;
  taxName: string;
  taxRate: number;
  taxType: 'vat' | 'gst' | 'sales_tax';
  appliesTo: Array<'items' | 'categories' | 'delivery' | 'service_fee'>;
  priceMode: 'inclusive' | 'exclusive';
  isDefault?: boolean;
  taxIdLabel?: string;
  taxIdValue?: string;
};

export type TaxCategoryPayload = {
  id?: string;
  name: string;
  description?: string;
  defaultTaxRuleId?: string;
};

export async function listTaxRules(api: ApiClient) {
  return z.array(taxRuleSchema).parse(await api.getData<unknown>('tax/rules'));
}

export async function saveTaxRule(api: ApiClient, payload: TaxRulePayload) {
  const path = payload.id ? 'tax/rules/update' : 'tax/rules/create';
  return taxRuleSchema.parse(await api.postData<unknown>(path, payload));
}

export async function listTaxCategories(api: ApiClient) {
  return z.array(taxCategorySchema).parse(await api.getData<unknown>('tax/categories'));
}

export async function saveTaxCategory(api: ApiClient, payload: TaxCategoryPayload) {
  const path = payload.id ? 'tax/categories/update' : 'tax/categories/create';
  return taxCategorySchema.parse(await api.postData<unknown>(path, payload));
}

export async function getTaxReport(api: ApiClient, params?: { locationId?: string; from?: string; to?: string }) {
  const search = new URLSearchParams();
  if (params?.locationId) search.set('locationId', params.locationId);
  if (params?.from) search.set('from', params.from);
  if (params?.to) search.set('to', params.to);
  return api.getData<Record<string, unknown>>(`tax/report${search.size ? `?${search.toString()}` : ''}`);
}
