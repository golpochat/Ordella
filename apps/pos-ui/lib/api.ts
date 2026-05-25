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
  bundleId: z.string().uuid().optional(),
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

const loyaltyCustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  pointsBalance: z.number(),
  storeCreditBalance: z.string(),
  lifetimeValue: z.string(),
  totalOrders: z.number().optional(),
  avgOrderValue: z.string().optional(),
  lastOrderAt: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  segments: z.array(z.string()).optional(),
  staffNotes: z.string().nullable().optional(),
});

export type PosLoyaltyCustomer = z.infer<typeof loyaltyCustomerSchema>;

const customerOrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().nullable(),
  status: z.string(),
  orderType: z.string(),
  total: z.string(),
  createdAt: z.string(),
});

export type PosCustomerOrder = z.infer<typeof customerOrderSchema>;

export async function listProducts() {
  const data = await api.getData<unknown[]>('admin/products');
  return z.array(productSchema).parse(data);
}

const catalogVariantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  priceDelta: z.string(),
  sku: z.string().nullable().optional(),
});

const catalogModifierOptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  priceDelta: z.string(),
});

const catalogModifierSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.string(),
  required: z.boolean(),
  options: z.array(catalogModifierOptionSchema),
});

export const posCatalogItemSchema = z.object({
  id: z.string().uuid(),
  itemType: z.enum(['product', 'bundle']).default('product'),
  bundleId: z.string().uuid().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  categoryId: z.string().uuid().nullable(),
  price: z.string(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  isActive: z.boolean(),
  inventoryTrackingEnabled: z.boolean(),
  stockLevel: z.number().int().nullable().optional(),
  stockStatus: z.enum(['ok', 'low', 'out']).optional(),
  isOutOfStock: z.boolean().optional(),
  bundleItems: z.array(z.object({
    itemId: z.string().uuid(),
    name: z.string().optional(),
    quantity: z.number().int(),
    isOptional: z.boolean().optional(),
  })).optional(),
  variants: z.array(catalogVariantSchema).default([]),
  modifiers: z.array(catalogModifierSchema).default([]),
});

export const posCatalogCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  sortOrder: z.number().int(),
});

export type PosCatalogItem = z.infer<typeof posCatalogItemSchema>;
export type PosCatalogCategory = z.infer<typeof posCatalogCategorySchema>;

const posCatalogBundleSchema = z.object({
  categories: z.array(posCatalogCategorySchema),
  items: z.array(posCatalogItemSchema),
});

export async function listPosCatalog(locationId?: string) {
  const data = await api.getData<unknown>('pos/catalog', {
    params: locationId ? { locationId } : undefined,
  });
  const parsed = posCatalogBundleSchema.parse(data);
  return parsed;
}

type CartLinePayload = {
  productId: string;
  bundleId?: string;
  quantity: number;
  variantId?: string;
  modifierOptionIds?: string[];
  notes?: string;
};

export async function createOrPatchCart(
  body:
    | { cartId?: string; item: CartLinePayload }
    | {
        cartId: string;
        action: 'add' | 'update' | 'remove';
        item: CartLinePayload;
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

export async function payOrder(
  orderId: string,
  method: 'cash' | 'card' | 'pos' | 'external',
  stripePaymentIntentId?: string,
) {
  const session = getSession();
  const data = await api.postData<unknown>('pos/payment', {
    ...session,
    orderId,
    method,
    stripePaymentIntentId,
  });
  return paymentSchema.parse(data);
}

const terminalIntentSchema = z.object({
  paymentIntentId: z.string(),
  clientSecret: z.string().nullable(),
});

export async function createTerminalPaymentIntent(orderId: string) {
  const data = await api.postData<unknown>('payments/terminal/payment-intent', { orderId });
  return terminalIntentSchema.parse(data);
}

export async function confirmTerminalPayment(orderId: string, paymentIntentId: string) {
  const data = await api.postData<unknown>('payments/terminal/confirm', {
    orderId,
    paymentIntentId,
  });
  return z.object({ paymentIntentId: z.string(), status: z.string() }).parse(data);
}

export async function getReceipt(orderId: string) {
  const data = await api.getData<unknown>(`pos/receipt/${orderId}`);
  return receiptSchema.parse(data);
}

const completeSaleSchema = paymentSchema.extend({
  orderNumber: z.string().nullable(),
  subtotal: z.string(),
  tax: z.string(),
  total: z.string(),
});

export type PosCompleteSale = z.infer<typeof completeSaleSchema>;

export async function completeSale(body: {
  cartId: string;
  orderType: 'pos' | 'pickup' | 'delivery';
  paymentMethod: 'cash' | 'card' | 'pos' | 'external';
  orderNotes?: string;
  customer?: { name?: string; phone?: string; email?: string; customerId?: string };
  loyaltyRedeemPoints?: number;
  giftCardCode?: string;
  giftCardAmount?: number;
  storeCreditAmount?: number;
}) {
  const session = getSession();
  const data = await api.postData<unknown>('pos/complete-sale', { ...session, ...body });
  return completeSaleSchema.parse(data);
}

export async function searchLoyaltyCustomers(q: string) {
  const data = await api.getData<unknown[]>(`loyalty/customers?q=${encodeURIComponent(q)}`);
  return z.array(loyaltyCustomerSchema).parse(data);
}

export async function updateCustomerCrm(body: { customerId: string; tags?: string[]; notes?: string }) {
  const data = await api.postData<unknown>('crm/customers/tag', body);
  return loyaltyCustomerSchema.parse(data);
}

export async function fetchLoyaltyCustomerOrders(customerId: string) {
  const data = await api.getData<unknown[]>(`loyalty/customers/${customerId}/orders`);
  return z.array(customerOrderSchema).parse(data);
}

const giftCardSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  balance: z.string(),
  currency: z.string(),
  isActive: z.boolean(),
});

export type PosGiftCard = z.infer<typeof giftCardSchema>;

export async function lookupGiftCard(code: string) {
  const data = await api.getData<unknown>(`public/giftcards/lookup?code=${encodeURIComponent(code)}`);
  return giftCardSchema.parse(data);
}
