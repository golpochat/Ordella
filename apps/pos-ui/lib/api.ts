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

const taxLineSchema = z.object({
  taxName: z.string(),
  taxType: z.string(),
  priceMode: z.string(),
  taxRate: z.string(),
  taxableAmount: z.string(),
  taxAmount: z.string(),
  jurisdiction: z.string(),
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
  discountTotal: z.string().optional(),
  tax: z.string(),
  taxLines: z.array(taxLineSchema).optional().default([]),
  total: z.string(),
  appliedPromotions: z.array(z.object({
    promotionId: z.string().uuid(),
    code: z.string().nullable().optional(),
    discountAmount: z.string(),
  })).optional(),
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
  discountTotal: z.string().optional(),
  tax: z.string(),
  taxLines: z.array(taxLineSchema).optional().default([]),
  total: z.string(),
  appliedPromotions: z.array(z.object({
    promotionId: z.string().uuid(),
    code: z.string().nullable().optional(),
    discountAmount: z.string(),
  })).optional(),
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
  globalItemId: z.string().uuid().nullable().optional(),
  catalogSource: z.enum(['local', 'inherited', 'overridden']).optional(),
  attributes: z.record(z.unknown()).optional(),
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

const posRecommendationItemSchema = z.object({
  item: posCatalogItemSchema,
  score: z.number(),
  reason: z.enum([
    'frequently_bought_together',
    'frequently_viewed_together',
    'customer_preference',
    'same_category',
    'popular_item',
  ]),
});

const posRecommendationResponseSchema = z.object({
  recommendations: z.array(posRecommendationItemSchema),
  strategy: z.array(z.string()),
  generatedAt: z.string(),
});

export type PosRecommendationItem = z.infer<typeof posRecommendationItemSchema>;

const pickingTaskLineSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number(),
  binCode: z.string().nullable(),
  zoneName: z.string().nullable(),
  status: z.string(),
});

const pickingTaskSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  orderId: z.string().uuid().nullable().optional(),
  status: z.enum(['pending', 'picking', 'completed']),
  priority: z.number().optional(),
  batchId: z.string().uuid().nullable().optional(),
  waveId: z.string().uuid().nullable().optional(),
  lines: z.array(pickingTaskLineSchema).optional().default([]),
  pickPath: z.array(z.object({
    zoneName: z.string(),
    binCode: z.string(),
    itemId: z.string().uuid(),
  })).optional().default([]),
  createdAt: z.string(),
});

const pickingOrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().nullable().optional(),
  locationId: z.string().uuid(),
  status: z.string(),
  total: z.string(),
  itemCount: z.number(),
  pickTask: pickingTaskSchema.nullable().optional(),
});

export type PickingTask = z.infer<typeof pickingTaskSchema>;
export type PickingOrder = z.infer<typeof pickingOrderSchema>;

const posCatalogBundleSchema = z.object({
  categories: z.array(posCatalogCategorySchema),
  items: z.array(posCatalogItemSchema),
});

const offlineSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  allowOfflineCardPayments: z.boolean().default(false),
  allowOutOfStockOfflineSales: z.boolean().default(false),
  allowUnknownStockOfflineSales: z.boolean().default(true),
  maxOfflineDurationMinutes: z.number().int().min(1).default(720),
  autoSyncIntervalSeconds: z.number().int().min(5).default(30),
});

const offlineInventorySnapshotSchema = z.object({
  productId: z.string().uuid(),
  stockLevel: z.number().int().nullable(),
  stockStatus: z.string().nullable().optional(),
  inventoryTrackingEnabled: z.boolean().optional(),
  updatedAt: z.string().optional(),
});

const offlineCustomerSnapshotSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  pointsBalance: z.number().optional(),
  storeCreditBalance: z.string().optional(),
});

const offlineStaffPermissionSchema = z.object({
  staffId: z.string().uuid(),
  role: z.string().nullable().optional(),
  permissions: z.array(z.string()),
  lastAuthenticatedAt: z.string().optional(),
});

const offlineBootstrapSchema = z.object({
  categories: z.array(posCatalogCategorySchema),
  items: z.array(posCatalogItemSchema),
  taxes: z.array(z.unknown()).default([]),
  discounts: z.array(z.unknown()).default([]),
  bundles: z.array(z.unknown()).default([]),
  inventory: z.array(offlineInventorySnapshotSchema).default([]),
  customers: z.array(offlineCustomerSnapshotSchema).default([]),
  staffPermissions: z.array(offlineStaffPermissionSchema).default([]),
  settings: offlineSettingsSchema,
  syncedAt: z.string(),
});

const offlineSyncResultSchema = z.object({
  clientOrderId: z.string(),
  orderId: z.string().uuid().optional(),
  status: z.enum(['synced', 'requires_review', 'failed']),
  conflicts: z.array(z.string()).default([]),
  message: z.string().optional(),
});

const offlineSyncResponseSchema = z.object({
  results: z.array(offlineSyncResultSchema),
  syncedAt: z.string(),
});

export type PosOfflineBootstrap = z.infer<typeof offlineBootstrapSchema>;
export type PosOfflineSyncResponse = z.infer<typeof offlineSyncResponseSchema>;

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

export type PosSearchResult = z.infer<typeof searchResultSchema>;

export async function listPosCatalog(locationId?: string) {
  const data = await api.getData<unknown>('pos/catalog', {
    params: locationId ? { locationId } : undefined,
  });
  const parsed = posCatalogBundleSchema.parse(data);
  return parsed;
}

export async function getOfflineBootstrap(locationId?: string) {
  const data = await api.getData<unknown>('pos/offline/bootstrap', {
    params: locationId ? { locationId } : undefined,
  });
  return offlineBootstrapSchema.parse(data);
}

export async function syncOfflineOrders(body: { orders: unknown[]; events?: unknown[] }) {
  const session = getSession();
  const data = await api.postData<unknown>('pos/offline/sync-orders', { ...session, ...body });
  return offlineSyncResponseSchema.parse(data);
}

export async function syncOfflineInventory(body: { adjustments: unknown[] }) {
  const session = getSession();
  const data = await api.postData<unknown>('pos/offline/sync-inventory', { ...session, ...body });
  return z.object({ syncedAt: z.string(), inventory: z.array(offlineInventorySnapshotSchema) }).parse(data);
}

export async function searchPosItems(options: {
  q?: string;
  categoryId?: string;
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  semantic?: boolean;
  limit?: number;
}) {
  const session = getSession();
  const path = options.semantic ? 'search/semantic' : 'search';
  const data = await api.getData<unknown>(path, {
    params: {
      q: options.q,
      entityType: 'item',
      locationId: session.locationId || undefined,
      categoryId: options.categoryId,
      priceMin: options.priceMin,
      priceMax: options.priceMax,
      inStockOnly: options.inStockOnly,
      sort: options.semantic ? 'relevance' : undefined,
      limit: options.limit ?? 50,
    },
  });
  return searchResponseSchema.parse(data);
}

export async function fetchPosRecommendations(options: {
  itemIds?: string[];
  customerId?: string;
  limit?: number;
} = {}) {
  const session = getSession();
  const data = await api.getData<unknown>('recommendations/pos/cart', {
    params: {
      locationId: session.locationId,
      itemIds: options.itemIds?.join(','),
      customerId: options.customerId,
      limit: options.limit,
    },
  });
  return posRecommendationResponseSchema.parse(data);
}

export async function trackPosRecommendationEvent(body: {
  itemId: string;
  customerId?: string;
  eventType: 'view' | 'add_to_cart' | 'purchase' | 'impression' | 'click';
  source?: string;
}) {
  await api.postData('recommendations/events', body);
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

export async function checkoutCart(
  cartId: string,
  options: { customerId?: string; couponCode?: string; discountPercent?: number; discountFixed?: number } = {},
) {
  const session = getSession();
  const data = await api.postData<unknown>('pos/checkout', { ...session, cartId, ...options });
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
  discountTotal: z.string().optional(),
  tax: z.string(),
  taxLines: z.array(taxLineSchema).optional().default([]),
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
  couponCode?: string;
  discountPercent?: number;
  discountFixed?: number;
}) {
  const session = getSession();
  const data = await api.postData<unknown>('pos/complete-sale', { ...session, ...body });
  return completeSaleSchema.parse(data);
}

export async function listPickingOrders(locationId?: string) {
  const data = await api.getData<unknown[]>('dark-store/orders', {
    params: { locationId: locationId || undefined },
  });
  return z.array(pickingOrderSchema).parse(data);
}

export async function createPickingTask(orderId: string, locationId?: string) {
  const data = await api.postData<unknown>('dark-store/pick-task/create', {
    orderId,
    locationId: locationId || undefined,
  });
  return pickingTaskSchema.parse(data);
}

export async function completePickingTask(pickTaskId: string) {
  const data = await api.postData<unknown>('dark-store/pick-task/complete', { pickTaskId });
  return pickingTaskSchema.parse(data);
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
