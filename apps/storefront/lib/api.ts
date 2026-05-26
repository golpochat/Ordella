import { createApiClient, createBrowserTokenStorage } from '@shared-utils';
import { z } from 'zod';
import { getApiBaseUrl, getConfiguredValue, getLocationId, getTenantId } from './config';

const tokenStorage = createBrowserTokenStorage();

const api = createApiClient({
  baseUrl: getApiBaseUrl(),
  getAccessToken: () => tokenStorage.getAccessToken(),
  getTenantId: () => getConfiguredValue(tokenStorage.getTenantId(), getTenantId()),
});

export function fetchTenantSettings() {
  return api.getData<unknown>('tenant/settings');
}

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
  itemType: z.enum(['product', 'bundle']).default('product'),
  bundleId: z.string().uuid().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  categoryId: z.string().uuid().nullable(),
  price: z.string(),
  sortOrder: z.number().int().optional(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  availableQuantity: z.number().nullable().optional(),
  isOutOfStock: z.boolean().optional(),
  inventoryTrackingEnabled: z.boolean().optional(),
  stockLevel: z.number().int().nullable().optional(),
  isActive: z.boolean().optional(),
  globalItemId: z.string().uuid().nullable().optional(),
  catalogSource: z.enum(['local', 'inherited', 'overridden']).optional(),
  attributes: z.record(z.unknown()).optional(),
  bundleItems: z.array(z.object({
    itemId: z.string().uuid(),
    name: z.string().optional(),
    quantity: z.number().int(),
    isOptional: z.boolean().optional(),
  })).optional(),
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

const taxLineSchema = z.object({
  taxName: z.string(),
  taxType: z.string(),
  priceMode: z.string(),
  taxRate: z.string(),
  taxableAmount: z.string(),
  taxAmount: z.string(),
  jurisdiction: z.string(),
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
  fulfilledByLocationId: z.string().uuid().nullable().optional(),
  fulfilledByLocationName: z.string().nullable().optional(),
  routingReason: z.string().nullable().optional(),
  estimatedDeliveryMinutes: z.number().nullable().optional(),
});

export type OnlineProduct = z.infer<typeof onlineProductSchema>;
export type OnlineMenu = z.infer<typeof onlineMenuSchema>;
export type OnlineBasket = z.infer<typeof onlineBasketSchema>;
export type CheckoutResult = z.infer<typeof checkoutResultSchema>;
export type PaymentResult = z.infer<typeof paymentResultSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;

const routingQuoteSchema = z.object({
  decisionId: z.string().uuid(),
  selectedLocationId: z.string().uuid().nullable(),
  selectedLocationName: z.string().nullable(),
  reason: z.string(),
  estimatedDeliveryMinutes: z.number().nullable(),
  fallbackOptions: z.array(z.record(z.unknown())),
  canFulfill: z.boolean(),
});

export type RoutingQuote = z.infer<typeof routingQuoteSchema>;

const recommendationItemSchema = z.object({
  item: onlineProductSchema,
  score: z.number(),
  reason: z.enum([
    'frequently_bought_together',
    'frequently_viewed_together',
    'customer_preference',
    'same_category',
    'popular_item',
  ]),
});

const recommendationResponseSchema = z.object({
  recommendations: z.array(recommendationItemSchema),
  strategy: z.array(z.string()),
  generatedAt: z.string(),
});

export type RecommendationItem = z.infer<typeof recommendationItemSchema>;
export type RecommendationResponse = z.infer<typeof recommendationResponseSchema>;

const searchResultSchema = z.object({
  entityType: z.string(),
  entityId: z.string().uuid(),
  title: z.string(),
  body: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).default({}),
  relevance: z.number().optional(),
  semanticScore: z.number().optional(),
});

const searchResponseSchema = z.object({
  results: z.array(searchResultSchema),
  total: z.number(),
  query: z.string(),
  generatedAt: z.string(),
});

export type StorefrontSearchResult = z.infer<typeof searchResultSchema>;

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

const publicBundleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  priceType: z.enum(['fixed', 'discounted', 'dynamic']),
  fixedPrice: z.string().nullable().optional(),
  discountAmount: z.string().nullable().optional(),
  discountPercent: z.string().nullable().optional(),
  isActive: z.boolean(),
  items: z.array(z.object({
    itemId: z.string().uuid(),
    quantity: z.number().int(),
    isOptional: z.boolean().optional(),
  })).default([]),
});

export async function fetchCatalog() {
  const locationId = getLocationId();
  const [data, bundlesData] = await Promise.all([
    api.getData<unknown>('public/menu', { params: { locationId } }),
    api.getData<unknown[]>('public/bundles/list', { params: { locationId } }).catch(() => []),
  ]);
  const menu = onlineMenuSchema.parse(data);
  const products = menu.products.map(mapCatalogItemToProduct);
  const bundles = z.array(publicBundleSchema).parse(bundlesData);
  return {
    categories: menu.categories,
    products: [
      ...products,
      ...bundles.map((catalogBundle) => mapBundleToProduct(catalogBundle, products)),
    ],
  } satisfies OnlineMenu;
}

export async function searchStorefrontItems(options: {
  q?: string;
  categoryId?: string;
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  semantic?: boolean;
  limit?: number;
}) {
  const path = options.semantic ? 'search/semantic' : 'search';
  const data = await api.getData<unknown>(path, {
    params: {
      q: options.q,
      entityType: 'item',
      locationId: getLocationId(),
      categoryId: options.categoryId,
      priceMin: options.priceMin,
      priceMax: options.priceMax,
      inStockOnly: options.inStockOnly,
      limit: options.limit ?? 50,
    },
  });
  return searchResponseSchema.parse(data);
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

function mapBundleToProduct(
  bundle: z.infer<typeof publicBundleSchema>,
  products: OnlineProduct[],
): OnlineProduct {
  const rawTotal = bundle.items.reduce((sum, item) => {
    const product = products.find((candidate) => candidate.id === item.itemId);
    return sum + (Number.parseFloat(product?.price ?? '0') * item.quantity);
  }, 0);
  const discount = bundle.discountAmount
    ? Number.parseFloat(bundle.discountAmount)
    : bundle.discountPercent
      ? rawTotal * (Number.parseFloat(bundle.discountPercent) / 100)
      : 0;
  const price = bundle.priceType === 'fixed'
    ? Number.parseFloat(bundle.fixedPrice ?? '0')
    : Math.max(0, rawTotal - discount);

  return {
    id: bundle.id,
    itemType: 'bundle',
    bundleId: bundle.id,
    name: bundle.name,
    description: bundle.description ?? null,
    categoryId: null,
    price: price.toFixed(2),
    sortOrder: 0,
    availableQuantity: null,
    isOutOfStock: false,
    inventoryTrackingEnabled: false,
    isActive: bundle.isActive,
    bundleItems: bundle.items.map((item) => ({
      ...item,
      name: products.find((product) => product.id === item.itemId)?.name,
    })),
    variants: [],
    modifiers: [],
  };
}

export async function fetchPublicMenu() {
  return fetchCatalog();
}

function recommendationParams(options?: { locationId?: string; customerId?: string; itemIds?: string[]; limit?: number }) {
  return {
    locationId: options?.locationId ?? getLocationId(),
    customerId: options?.customerId,
    itemIds: options?.itemIds?.join(','),
    limit: options?.limit,
  };
}

export async function fetchItemRecommendations(
  itemId: string,
  options?: { customerId?: string; limit?: number },
) {
  const data = await api.getData<unknown>(`recommendations/item/${itemId}`, {
    params: recommendationParams(options),
  });
  return recommendationResponseSchema.parse(data);
}

export async function fetchCustomerRecommendations(
  customerId: string,
  options?: { itemIds?: string[]; limit?: number },
) {
  const data = await api.getData<unknown>(`recommendations/customer/${customerId}`, {
    params: recommendationParams(options),
  });
  return recommendationResponseSchema.parse(data);
}

export async function fetchCartRecommendations(options?: {
  itemIds?: string[];
  customerId?: string;
  limit?: number;
}) {
  const data = await api.getData<unknown>('recommendations/cart', {
    params: recommendationParams(options),
  });
  return recommendationResponseSchema.parse(data);
}

export async function trackRecommendationEvent(body: {
  itemId: string;
  customerId?: string;
  eventType: 'view' | 'add_to_cart' | 'purchase' | 'impression' | 'click';
  source?: string;
}) {
  await api.postData('recommendations/events', body);
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

export async function quoteRouting(body: {
  orderType: 'delivery' | 'pickup' | 'online' | 'in_store';
  customerAddress?: {
    addressLine1?: string;
    city?: string;
    postalCode?: string;
  };
  items: Array<{ productId: string; quantity: number }>;
}) {
  const data = await api.postData<unknown>('routing/decide', {
    fromLocationId: getLocationId(),
    ...body,
  });
  return routingQuoteSchema.parse(data);
}

export function isProductOrderable(product: OnlineProduct): boolean {
  if (product.isActive === false) return false;
  if (product.isOutOfStock) return false;
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
  discountTotal: z.string().optional(),
  tax: z.string(),
  taxLines: z.array(taxLineSchema).optional().default([]),
  total: z.string(),
  appliedPromotions: z.array(z.object({
    promotionId: z.string().uuid(),
    code: z.string().nullable().optional(),
    discountAmount: z.string(),
  })).optional(),
  items: z.array(z.unknown()).optional(),
});

export type OnlineOrderResult = z.infer<typeof onlineOrderResponseSchema>;

export async function createOnlineOrder(body: {
  orderType: 'delivery' | 'pickup' | 'online' | 'in_store';
  customer: { name: string; phone: string; email?: string };
  customerId?: string;
  items: Array<{
    itemId: string;
    variantId?: string;
    bundleId?: string;
    selectedBundleItemIds?: string[];
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
  couponCode?: string;
  paymentMethod?: 'cash' | 'card';
  loyaltyRedeemPoints?: number;
  giftCardCode?: string;
  giftCardAmount?: number;
  storeCreditAmount?: number;
}) {
  const locationId = getLocationId();
  const data = await api.postData<unknown>('orders/create-online', {
    locationId,
    ...body,
  });
  return onlineOrderResponseSchema.parse(data);
}

const publicLoyaltyCustomerSchema = z.object({
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
  segments: z.array(z.string()).optional(),
});

export type PublicLoyaltyCustomer = z.infer<typeof publicLoyaltyCustomerSchema>;

export async function fetchLoyaltyCustomer(params: { email?: string; phone?: string }) {
  const query = new URLSearchParams();
  if (params.email) query.set('email', params.email);
  if (params.phone) query.set('phone', params.phone);
  const data = await api.getData<unknown | null>(`public/loyalty/customer?${query.toString()}`);
  return data ? publicLoyaltyCustomerSchema.parse(data) : null;
}

const loyaltySettingsSchema = z.object({
  isEnabled: z.boolean(),
  redeemRate: z.string(),
  minRedeemPoints: z.number(),
  maxRedeemPercent: z.number(),
});

export async function fetchLoyaltySettings() {
  const data = await api.getData<unknown>('public/loyalty/settings');
  return loyaltySettingsSchema.parse(data);
}

const publicGiftCardSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  balance: z.string(),
  currency: z.string(),
  isActive: z.boolean(),
});

const creditTransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.string(),
  type: z.string(),
  orderId: z.string().uuid().nullable(),
  createdAt: z.string(),
});

export type PublicGiftCard = z.infer<typeof publicGiftCardSchema>;
export type PublicCreditTransaction = z.infer<typeof creditTransactionSchema>;

export async function fetchGiftCard(code: string) {
  const data = await api.getData<unknown>(`public/giftcards/lookup?code=${encodeURIComponent(code)}`);
  return publicGiftCardSchema.parse(data);
}

export async function fetchCustomerGiftCards(customerId: string) {
  const data = await api.getData<unknown[]>(`public/giftcards/list?customerId=${encodeURIComponent(customerId)}`);
  return z.array(publicGiftCardSchema).parse(data);
}

export async function fetchStoreCreditHistory(customerId: string) {
  const data = await api.getData<unknown[]>(`public/storecredit/history?customerId=${encodeURIComponent(customerId)}`);
  return z.array(creditTransactionSchema).parse(data);
}

const customerAddressSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  postalCode: z.string().optional(),
  instructions: z.string().optional(),
  isDefault: z.boolean(),
});

const customerAccountSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  pointsBalance: z.number().optional(),
  loyaltyPoints: z.number().optional(),
  storeCreditBalance: z.string().optional(),
  lifetimeValue: z.string().optional(),
  totalOrders: z.number().optional(),
  avgOrderValue: z.string().optional(),
  orderFrequency: z.string().optional(),
  segments: z.array(z.string()).optional(),
  addresses: z.array(customerAddressSchema).optional(),
});

export type StorefrontCustomerAccount = z.infer<typeof customerAccountSchema>;
export type StorefrontCustomerAddress = z.infer<typeof customerAddressSchema>;

export function hasCustomerSession(): boolean {
  const token = tokenStorage.getAccessToken()?.trim();
  if (!token) return false;

  try {
    const [, payload] = token.split('.');
    if (!payload || typeof window === 'undefined') return false;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const decoded = JSON.parse(window.atob(padded)) as { type?: string };
    return decoded.type === 'customer';
  } catch {
    return false;
  }
}

export async function fetchCustomerAccount() {
  if (!hasCustomerSession()) {
    return null;
  }
  const data = await api.getData<unknown>('public/customer/me');
  return customerAccountSchema.parse(data);
}
