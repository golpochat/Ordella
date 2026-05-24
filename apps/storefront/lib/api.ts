import { createApiClient } from '@shared-utils';
import { z } from 'zod';
import { getApiBaseUrl, getLocationId, getTenantId } from './config';

const api = createApiClient({
  baseUrl: getApiBaseUrl(),
  getAccessToken: () => null,
  getTenantId: () => getTenantId(),
});

const modifierOptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  priceDelta: z.string(),
});

const modifierSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.string(),
  required: z.boolean(),
  options: z.array(modifierOptionSchema),
});

const onlineVariantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  priceDelta: z.string(),
  sku: z.string().nullable().optional(),
});

export const onlineProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  categoryId: z.string().uuid().nullable(),
  price: z.string(),
  sortOrder: z.number().int().optional(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  availableQuantity: z.number().nullable().optional(),
  inventoryTrackingEnabled: z.boolean().optional(),
  stockLevel: z.number().int().nullable().optional(),
  isActive: z.boolean().optional(),
  variants: z.array(onlineVariantSchema).default([]),
  modifiers: z.array(modifierSchema).default([]),
});

export const onlineMenuSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      sortOrder: z.number().int(),
    }),
  ),
  products: z.array(onlineProductSchema),
});

const basketLineSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1),
  modifierOptionIds: z.array(z.string().uuid()).optional(),
  notes: z.string().optional(),
});

export const onlineBasketSchema = z.object({
  sessionId: z.string().uuid(),
  locationId: z.string().uuid(),
  items: z.array(basketLineSchema),
  couponCode: z.string().optional(),
  orderId: z.string().uuid().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const checkoutTotalsSchema = z.object({
  subtotal: z.string(),
  discountTotal: z.string(),
  taxTotal: z.string(),
  serviceChargeTotal: z.string(),
  deliveryFee: z.string(),
  grandTotal: z.string(),
});

export const checkoutResultSchema = z.object({
  sessionId: z.string().uuid(),
  orderType: z.string(),
  customer: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string(),
  }),
  delivery: z
    .object({
      addressLine1: z.string(),
      addressLine2: z.string().optional(),
      city: z.string(),
      postalCode: z.string().optional(),
      instructions: z.string().optional(),
      contactPhone: z.string().optional(),
    })
    .optional(),
  totals: checkoutTotalsSchema,
  appliedPromotions: z.array(
    z.object({
      promotionId: z.string().uuid(),
      code: z.string().nullable().optional(),
      discountAmount: z.string(),
    }),
  ),
  paymentContext: z.record(z.unknown()),
});

export const paymentResultSchema = z.object({
  sessionId: z.string().uuid(),
  orderId: z.string().uuid(),
  orderNumber: z.string().nullable(),
  paymentId: z.string().uuid(),
  paymentIntentId: z.string(),
  paymentStatus: z.string(),
  orderStatus: z.string(),
  total: z.string(),
});

export const orderStatusSchema = z.object({
  orderId: z.string().uuid(),
  orderNumber: z.string().nullable(),
  status: z.string(),
  paymentStatus: z.string(),
  orderType: z.string(),
  total: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type OnlineProduct = z.infer<typeof onlineProductSchema>;
export type OnlineMenu = z.infer<typeof onlineMenuSchema>;
export type OnlineBasket = z.infer<typeof onlineBasketSchema>;
export type CheckoutResult = z.infer<typeof checkoutResultSchema>;
export type PaymentResult = z.infer<typeof paymentResultSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;

const catalogBundleSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      sortOrder: z.number().int(),
    }),
  ),
  items: z.array(onlineProductSchema),
});

export async function fetchCatalog() {
  const data = await api.getData<unknown>('catalog');
  const bundle = catalogBundleSchema.parse(data);
  return {
    categories: bundle.categories,
    products: bundle.items.map(mapCatalogItemToProduct),
  } satisfies OnlineMenu;
}

function mapCatalogItemToProduct(item: z.infer<typeof onlineProductSchema>): OnlineProduct {
  const stock = item.stockLevel ?? item.availableQuantity ?? null;
  return {
    ...item,
    description: item.description ?? null,
    sortOrder: item.sortOrder ?? 0,
    availableQuantity: stock,
    modifiers: item.modifiers ?? [],
    variants: item.variants ?? [],
  };
}

export async function fetchPublicMenu() {
  const locationId = getLocationId();
  try {
    return await fetchCatalog();
  } catch {
    const data = await api.getData<unknown>('public/menu', { params: { locationId } });
    return onlineMenuSchema.parse(data);
  }
}

export async function fetchProductsByCategory(categoryId: string) {
  const locationId = getLocationId();
  const data = await api.getData<unknown[]>(`public/menu/${categoryId}`, {
    params: { locationId },
  });
  return z.array(onlineProductSchema).parse(data);
}

export async function createOrPatchBasket(
  body:
    | { sessionId?: string; item: { productId: string; quantity: number; modifierOptionIds?: string[] } }
    | {
        sessionId: string;
        action: 'add' | 'update' | 'remove';
        item: { itemId?: string; productId?: string; quantity: number; modifierOptionIds?: string[] };
      },
) {
  const locationId = getLocationId();

  if ('action' in body) {
    const data = await api.patch('public/basket/items', body);
    return onlineBasketSchema.parse((data as { data: unknown }).data);
  }

  const data = await api.postData<unknown>('public/basket', { locationId, ...body });
  return onlineBasketSchema.parse(data);
}

export async function submitCheckout(body: {
  sessionId: string;
  orderType: 'delivery' | 'pickup' | 'online';
  customer: { name: string; phone: string; email: string };
  delivery?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode?: string;
    instructions?: string;
    contactPhone?: string;
  };
  couponCode?: string;
  paymentMethod?: string;
}) {
  const data = await api.postData<unknown>('public/checkout', body);
  return checkoutResultSchema.parse(data);
}

export async function submitPayment(body: {
  sessionId: string;
  method: 'cash' | 'card' | 'pos' | 'wallet';
}) {
  const data = await api.postData<unknown>('public/payment', body);
  return paymentResultSchema.parse(data);
}

export async function fetchOrderStatus(orderId: string) {
  const data = await api.getData<unknown>(`public/order-status/${orderId}`);
  return orderStatusSchema.parse(data);
}

export function isProductOrderable(product: OnlineProduct): boolean {
  if (product.isActive === false) return false;
  if (product.inventoryTrackingEnabled) {
    const qty = product.availableQuantity ?? product.stockLevel;
    return qty !== null && qty !== undefined && qty > 0;
  }
  if (product.availableQuantity !== null && product.availableQuantity !== undefined) {
    return product.availableQuantity > 0;
  }
  return true;
}

const onlineOrderResponseSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().nullable(),
  orderType: z.string(),
  status: z.string(),
  paymentStatus: z.string(),
  subtotal: z.string(),
  tax: z.string(),
  total: z.string(),
  items: z.array(z.unknown()).optional(),
});

export type OnlineOrderResult = z.infer<typeof onlineOrderResponseSchema>;

export async function createOnlineOrder(body: {
  orderType: 'delivery' | 'pickup' | 'online' | 'in_store';
  customer: { name: string; phone: string; email?: string };
  items: Array<{
    itemId: string;
    variantId?: string;
    modifiers?: string[];
    quantity: number;
    price?: string;
  }>;
  delivery?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode?: string;
    instructions?: string;
  };
  notes?: string;
  paymentMethod?: 'cash' | 'card';
}) {
  const locationId = getLocationId();
  const data = await api.postData<unknown>('orders/create-online', {
    locationId,
    ...body,
  });
  return onlineOrderResponseSchema.parse(data);
}
