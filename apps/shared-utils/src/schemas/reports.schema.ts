import { z } from 'zod';

export const dailySalesSummarySchema = z.object({
  date: z.string(),
  totalOrders: z.number().int(),
  totalRevenue: z.string(),
  totalDiscounts: z.string(),
  totalRefunds: z.string(),
});

export const inventoryMovementSummarySchema = z.object({
  date: z.string(),
  productId: z.string().uuid(),
  quantityIn: z.string(),
  quantityOut: z.string(),
});

export const deliveryPerformanceSummarySchema = z.object({
  date: z.string(),
  completed: z.number().int(),
  failed: z.number().int(),
  avgDeliveryTime: z.string(),
});

export const promotionUsageSummarySchema = z.object({
  date: z.string(),
  promotionId: z.string().uuid(),
  applicationCount: z.number().int(),
  totalDiscount: z.string(),
});

export type DailySalesSummary = z.infer<typeof dailySalesSummarySchema>;
export type InventoryMovementSummary = z.infer<typeof inventoryMovementSummarySchema>;
export type DeliveryPerformanceSummary = z.infer<typeof deliveryPerformanceSummarySchema>;
export type PromotionUsageSummary = z.infer<typeof promotionUsageSummarySchema>;
