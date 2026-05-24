import { z } from 'zod';

export const promotionTypeSchema = z.enum(['automatic', 'coupon']);

export const promotionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  type: promotionTypeSchema,
  value: z.string(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  code: z.string().nullable().optional(),
  usageLimit: z.number().int().nullable().optional(),
  usageCount: z.number().int().optional(),
  isActive: z.boolean(),
  status: z.string().optional(),
});

export type Promotion = z.infer<typeof promotionSchema>;
