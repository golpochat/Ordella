import { z } from 'zod';

export const promotionTypeSchema = z.enum([
  'automatic',
  'coupon',
  'percentage',
  'fixed',
  'bxgy',
  'mix-and-match',
  'combo',
  'threshold',
  'category',
  'time-based',
  'location',
  'customer-segment',
  'dynamic-pricing',
]);

export const promotionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  type: promotionTypeSchema,
  value: z.string(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  code: z.string().nullable().optional(),
  buyQuantity: z.number().int().nullable().optional(),
  getQuantity: z.number().int().nullable().optional(),
  minSpend: z.string().nullable().optional(),
  applicableLocations: z.array(z.string().uuid()).optional(),
  applicableCategories: z.array(z.string().uuid()).optional(),
  applicableItems: z.array(z.string().uuid()).optional(),
  autoApply: z.boolean().optional(),
  channel: z.enum(['pos', 'online', 'both']).optional(),
  usageLimit: z.number().int().nullable().optional(),
  usageCount: z.number().int().optional(),
  priority: z.number().int().optional(),
  stackable: z.boolean().optional(),
  conflictStrategy: z.enum(['best_price', 'priority', 'exclusive']).optional(),
  eligibleCustomerSegments: z.array(z.string()).optional(),
  dynamicPricingRules: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
  isActive: z.boolean(),
  status: z.string().optional(),
});

export type Promotion = z.infer<typeof promotionSchema>;
