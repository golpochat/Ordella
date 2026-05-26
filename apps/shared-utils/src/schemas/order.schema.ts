import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'pending',
  'accepted',
  'picking',
  'picked',
  'preparing',
  'ready',
  'handed_to_driver',
  'out_for_delivery',
  'completed',
  'refunded',
  'cancelled',
  'failed',
]);

export const orderTypeSchema = z.enum([
  'delivery',
  'pickup',
  'dine_in',
  'pos',
  'online',
]);

export const orderPaymentStatusSchema = z.enum([
  'unpaid',
  'paid',
  'payment_failed',
  'refunded',
]);

export const orderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  quantity: z.number().int().positive(),
  price: z.string(),
  notes: z.string().nullable().optional(),
});

export const orderSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid(),
  customerId: z.string().uuid().nullable().optional(),
  orderType: orderTypeSchema,
  status: orderStatusSchema,
  paymentStatus: orderPaymentStatusSchema,
  paymentMethod: z.string().nullable().optional(),
  subtotal: z.string(),
  tax: z.string(),
  total: z.string(),
  orderNumber: z.string().nullable().optional(),
  items: z.array(orderItemSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().nullable().optional(),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
