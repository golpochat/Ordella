import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const supplierProfileSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  contactName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  portalUserEmail: z.string().nullable().optional(),
  lastLoginAt: z.string().nullable().optional(),
  isActive: z.boolean(),
});

const supplierLoginSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  supplierId: z.string().uuid(),
  name: z.string(),
});

const purchaseOrderItemSchema = z.object({
  id: z.string().uuid(),
  purchaseOrderId: z.string().uuid(),
  itemId: z.string().uuid(),
  quantityOrdered: z.number().int(),
  quantityReceived: z.number().int(),
  costPrice: z.string(),
  item: z.object({ id: z.string().uuid(), name: z.string() }).optional(),
});

const purchaseOrderSchema = z.object({
  id: z.string().uuid(),
  supplierId: z.string().uuid(),
  locationId: z.string().uuid(),
  status: z.enum(['draft', 'sent', 'received', 'partial', 'cancelled']),
  supplierStatus: z.enum(['pending', 'confirmed', 'rejected', 'shipped']).default('pending'),
  totalCost: z.string(),
  expectedDeliveryDate: z.string().nullable().optional(),
  supplierExpectedDeliveryDate: z.string().nullable().optional(),
  supplierNotes: z.string().nullable().optional(),
  sentAt: z.string().nullable().optional(),
  receivedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  location: z.object({ id: z.string().uuid(), name: z.string() }).optional(),
  items: z.array(purchaseOrderItemSchema).default([]),
});

const supplierMessageSchema = z.object({
  id: z.string().uuid(),
  supplierId: z.string().uuid(),
  tenantId: z.string().uuid(),
  purchaseOrderId: z.string().uuid().nullable().optional(),
  senderType: z.enum(['supplier', 'merchant']),
  message: z.string(),
  createdAt: z.string(),
});

const supplierCatalogItemSchema = z.object({
  id: z.string().uuid(),
  supplierId: z.string().uuid(),
  itemId: z.string().uuid(),
  costPrice: z.string(),
  sku: z.string().nullable().optional(),
  leadTimeDays: z.number().int(),
  minOrderQty: z.number().int(),
  item: z.object({ id: z.string().uuid(), name: z.string() }).optional(),
});

const dashboardSchema = z.object({
  profile: supplierProfileSchema,
  metrics: z.object({
    pendingPOs: z.number(),
    confirmedPOs: z.number(),
    rejectedPOs: z.number(),
    shippedPOs: z.number(),
    unreadMessages: z.number(),
    onTimeDeliveryRate: z.number(),
    fillRate: z.number(),
    averageConfirmationHours: z.number(),
    leadTimeAccuracyDays: z.number(),
    suppliedItems: z.number(),
  }),
  recentPurchaseOrders: z.array(purchaseOrderSchema),
  recentMessages: z.array(supplierMessageSchema),
});

export type SupplierLogin = z.infer<typeof supplierLoginSchema>;
export type SupplierProfile = z.infer<typeof supplierProfileSchema>;
export type SupplierPurchaseOrder = z.infer<typeof purchaseOrderSchema>;
export type SupplierCatalogItem = z.infer<typeof supplierCatalogItemSchema>;
export type SupplierMessage = z.infer<typeof supplierMessageSchema>;
export type SupplierDashboard = z.infer<typeof dashboardSchema>;

export async function loginSupplier(api: ApiClient, body: { email: string; password: string }): Promise<SupplierLogin> {
  const data = await api.postData<unknown>('supplier/login', body, { skipAuth: true });
  return supplierLoginSchema.parse(data);
}

export async function getDashboard(api: ApiClient): Promise<SupplierDashboard> {
  const data = await api.getData<unknown>('supplier/dashboard');
  return dashboardSchema.parse(data);
}

export async function getProfile(api: ApiClient): Promise<SupplierProfile> {
  const data = await api.getData<unknown>('supplier/profile');
  return supplierProfileSchema.parse(data);
}

export async function updateProfile(api: ApiClient, body: Record<string, unknown>): Promise<SupplierProfile> {
  const data = await api.postData<unknown>('supplier/profile/update', body);
  return supplierProfileSchema.parse(data);
}

export async function updatePassword(api: ApiClient, body: Record<string, unknown>): Promise<SupplierProfile> {
  const data = await api.postData<unknown>('supplier/password/update', body);
  return supplierProfileSchema.parse(data);
}

export async function listPurchaseOrders(api: ApiClient): Promise<SupplierPurchaseOrder[]> {
  const data = await api.getData<unknown[]>('supplier/pos');
  return z.array(purchaseOrderSchema).parse(data);
}

export async function confirmPurchaseOrder(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('supplier/po/confirm', body);
  return purchaseOrderSchema.parse(data);
}

export async function rejectPurchaseOrder(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('supplier/po/reject', body);
  return purchaseOrderSchema.parse(data);
}

export async function updatePurchaseOrderDelivery(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('supplier/po/update-delivery', body);
  return purchaseOrderSchema.parse(data);
}

export async function markPurchaseOrderShipped(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('supplier/po/ship', body);
  return purchaseOrderSchema.parse(data);
}

export async function listMessages(api: ApiClient, purchaseOrderId?: string): Promise<SupplierMessage[]> {
  const data = await api.getData<unknown[]>('supplier/messages', { params: { purchaseOrderId } });
  return z.array(supplierMessageSchema).parse(data);
}

export async function sendMessage(api: ApiClient, body: Record<string, unknown>): Promise<SupplierMessage> {
  const data = await api.postData<unknown>('supplier/messages/send', body);
  return supplierMessageSchema.parse(data);
}

export async function listCatalog(api: ApiClient): Promise<SupplierCatalogItem[]> {
  const data = await api.getData<unknown[]>('supplier/catalog');
  return z.array(supplierCatalogItemSchema).parse(data);
}

export async function updateCatalogItem(api: ApiClient, body: Record<string, unknown>): Promise<SupplierCatalogItem> {
  const data = await api.postData<unknown>('supplier/catalog/update', body);
  return supplierCatalogItemSchema.parse(data);
}
