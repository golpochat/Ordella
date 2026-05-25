import { z } from 'zod';

export const inventoryStockStatusSchema = z.enum(['ok', 'low', 'out']);

export const inventoryListItemSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid(),
  itemId: z.string().uuid().nullable().optional(),
  name: z.string(),
  sku: z.string(),
  categoryId: z.string().uuid().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  stockLevel: z.number().int(),
  reorderPoint: z.number().int().nullable().optional(),
  isActive: z.boolean(),
  status: inventoryStockStatusSchema,
  quantityOnHand: z.string(),
  quantityReserved: z.string(),
  quantityAvailable: z.string(),
  updatedAt: z.coerce.date(),
});

export type InventoryListItem = z.infer<typeof inventoryListItemSchema>;

export const multiStoreInventoryItemSchema = inventoryListItemSchema.extend({
  locationName: z.string(),
  locationType: z.string(),
  syncSource: z.string(),
  lastSyncedAt: z.coerce.date().nullable().optional(),
  safetyStockLevel: z.number().int().nullable().optional(),
  incomingStock: z.string(),
  inTransitStock: z.string(),
  availableToSell: z.string(),
  discrepancy: z.string().nullable().optional(),
});

export type MultiStoreInventoryItem = z.infer<typeof multiStoreInventoryItemSchema>;

export const inventorySyncLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  itemId: z.string().uuid().nullable(),
  fromLocationId: z.string().uuid().nullable(),
  toLocationId: z.string().uuid().nullable(),
  quantity: z.string(),
  reason: z.string(),
  createdAt: z.coerce.date(),
});

export type InventorySyncLog = z.infer<typeof inventorySyncLogSchema>;

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

export const inventoryAdjustmentLogSchema = z.object({
  id: z.string().uuid(),
  stockItemId: z.string().uuid(),
  locationId: z.string().uuid(),
  change: z.number(),
  reason: z.string().nullable(),
  type: z.string(),
  staffId: z.string().uuid().nullable().optional(),
  createdAt: z.coerce.date(),
});

export const inventorySummarySchema = z.object({
  counts: z.object({
    total: z.number().int(),
    low: z.number().int(),
    out: z.number().int(),
    ok: z.number().int(),
  }),
  recentAdjustments: z.array(inventoryAdjustmentLogSchema),
});

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
