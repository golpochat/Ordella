import { z } from 'zod';

export const inventoryItemSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid(),
  productId: z.string().uuid().nullable().optional(),
  name: z.string(),
  sku: z.string(),
  unit: z.string(),
  quantityOnHand: z.string(),
  quantityReserved: z.string(),
  quantityAvailable: z.string().optional(),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;

export const stockMovementSchema = z.object({
  id: z.string().uuid(),
  stockItemId: z.string().uuid(),
  locationId: z.string().uuid(),
  kind: z.string(),
  quantityDelta: z.string(),
  reason: z.string().nullable().optional(),
  createdAt: z.coerce.date().optional(),
});

export type StockMovement = z.infer<typeof stockMovementSchema>;
