import { z } from 'zod';

export const productStatusSchema = z.enum(['active', 'inactive', 'draft']);

export const productSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  taxCategoryId: z.string().uuid().nullable().optional(),
  price: z.string(),
  status: productStatusSchema,
  sortOrder: z.number().int(),
  channelVisibility: z.record(z.boolean()).optional(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  inventoryTrackingEnabled: z.boolean().optional(),
  stockLevel: z.number().int().nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().nullable().optional(),
});

export type Product = z.infer<typeof productSchema>;
