import { z } from 'zod';

export const categorySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().nullable().optional(),
});

export type Category = z.infer<typeof categorySchema>;
