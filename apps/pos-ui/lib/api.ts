import { createApiClient, productSchema } from '@shared-utils';
import { z } from 'zod';
import { getSession } from './session';

const api = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
  getAccessToken: () => (typeof window === 'undefined' ? null : localStorage.getItem('ordella.accessToken')),
  getTenantId: () => (typeof window === 'undefined' ? null : localStorage.getItem('ordella.tenantId')),
});

const posCartLineSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1),
  modifierOptionIds: z.array(z.string().uuid()).optional(),
  notes: z.string().optional(),
});

export const posCartSchema = z.object({
  cartId: z.string().uuid(),
  terminalId: z.string().uuid(),
  cashierId: z.string().uuid(),
  shiftId: z.string().uuid(),
  locationId: z.string().uuid(),
  items: z.array(posCartLineSchema),
  orderId: z.string().uuid().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const checkoutSchema = z.object({
  cartId: z.string().uuid(),
  orderId: z.string().uuid(),
  orderNumber: z.string().nullable(),
  subtotal: z.string(),
  tax: z.string(),
  total: z.string(),
});

const paymentSchema = z.object({
  orderId: z.string().uuid(),
  paymentId: z.string().uuid(),
  status: z.string(),
  paymentStatus: z.string(),
  orderStatus: z.string(),
});

const receiptSchema = z.object({
  orderId: z.string().uuid(),
  orderNumber: z.string().nullable(),
  terminalId: z.string().uuid(),
  cashierId: z.string().uuid(),
  shiftId: z.string().uuid(),
  locationId: z.string().uuid(),
  orderType: z.string(),
  status: z.string(),
  paymentStatus: z.string(),
  subtotal: z.string(),
  tax: z.string(),
  total: z.string(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      variantId: z.string().nullable(),
      quantity: z.number().int(),
      price: z.string(),
      notes: z.string().nullable(),
    }),
  ),
  paidAt: z.string().nullable(),
  createdAt: z.string(),
});

export type PosCart = z.infer<typeof posCartSchema>;
export type PosCheckout = z.infer<typeof checkoutSchema>;
export type PosPayment = z.infer<typeof paymentSchema>;
export type PosReceipt = z.infer<typeof receiptSchema>;

export async function listProducts() {
  const data = await api.getData<unknown[]>('admin/products');
  return z.array(productSchema).parse(data);
}

export async function createOrPatchCart(
  body:
    | { cartId?: string; item: { productId: string; quantity: number; modifierOptionIds?: string[] } }
    | {
        cartId: string;
        action: 'add' | 'update' | 'remove';
        item: { productId: string; quantity: number; modifierOptionIds?: string[] };
      },
) {
  const session = getSession();
  if ('action' in body) {
    const data = await api.patch('pos/cart/items', { ...session, ...body });
    return posCartSchema.parse((data as { data: unknown }).data);
  }

  const data = await api.postData<unknown>('pos/cart', { ...session, locationId: session.locationId, ...body });
  return posCartSchema.parse(data);
}

export async function checkoutCart(cartId: string, customerId?: string) {
  const session = getSession();
  const data = await api.postData<unknown>('pos/checkout', { ...session, cartId, customerId });
  return checkoutSchema.parse(data);
}

export async function payOrder(orderId: string, method: 'cash' | 'card' | 'pos') {
  const session = getSession();
  const data = await api.postData<unknown>('pos/payment', { ...session, orderId, method });
  return paymentSchema.parse(data);
}

export async function getReceipt(orderId: string) {
  const data = await api.getData<unknown>(`pos/receipt/${orderId}`);
  return receiptSchema.parse(data);
}
