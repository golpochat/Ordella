import { z } from 'zod';
import { productStatusSchema } from './product.schema';

const catalogModifierOptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  priceDelta: z.string(),
});

const catalogModifierSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.string().optional(),
  required: z.boolean(),
  options: z.array(catalogModifierOptionSchema),
});

const catalogVariantSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
  name: z.string(),
  priceDelta: z.string(),
  sku: z.string().nullable().optional(),
});

export const catalogItemSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  categoryId: z.string().uuid().nullable(),
  taxCategoryId: z.string().uuid().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.string(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean(),
  status: productStatusSchema,
  sortOrder: z.number().int(),
  inventoryTrackingEnabled: z.boolean(),
  stockLevel: z.number().int().nullable().optional(),
  channelVisibility: z.record(z.boolean()).optional(),
  globalItemId: z.string().uuid().nullable().optional(),
  globalCategoryId: z.string().uuid().nullable().optional(),
  catalogSource: z.enum(['local', 'inherited', 'overridden']).optional(),
  baseName: z.string().nullable().optional(),
  baseDescription: z.string().nullable().optional(),
  basePrice: z.string().nullable().optional(),
  attributes: z.record(z.unknown()).optional(),
  overrideAttributes: z.record(z.unknown()).optional(),
  variants: z.array(catalogVariantSchema).default([]),
  modifiers: z.array(catalogModifierSchema).default([]),
});

export type CatalogItem = z.infer<typeof catalogItemSchema>;
