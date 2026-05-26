import { z } from 'zod';

export const categorySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int(),
  isActive: z.boolean().optional(),
  globalCategoryId: z.string().uuid().nullable().optional(),
  taxCategoryId: z.string().uuid().nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().nullable().optional(),
});

export type Category = z.infer<typeof categorySchema>;
