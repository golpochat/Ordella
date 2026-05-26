import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const supplierItemSchema = z.object({
  id: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  itemId: z.string().uuid(),
  costPrice: z.string(),
  sku: z.string().nullable().optional(),
  leadTimeDays: z.number().int(),
  minOrderQty: z.number().int(),
  caseSize: z.number().int().default(1),
  item: z.object({ id: z.string().uuid(), name: z.string() }).optional(),
});

export const supplierSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  contactName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  portalUserEmail: z.string().nullable().optional(),
  lastLoginAt: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  items: z.array(supplierItemSchema).default([]),
});

const purchaseOrderItemSchema = z.object({
  id: z.string().uuid(),
  purchaseOrderId: z.string().uuid(),
  itemId: z.string().uuid(),
  quantityOrdered: z.number().int(),
  quantityReceived: z.number().int(),
  costPrice: z.string(),
  priceMode: z.enum(['inclusive', 'exclusive']).optional(),
  taxRate: z.string().optional(),
  taxableAmount: z.string().optional(),
  taxAmount: z.string().optional(),
  item: z.object({ id: z.string().uuid(), name: z.string() }).optional(),
});

const deliveryDocumentSchema = z.object({
  name: z.string(),
  url: z.string(),
  contentType: z.string().nullable().optional(),
  sizeBytes: z.number().nullable().optional(),
  uploadedAt: z.string(),
});

export const purchaseOrderSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  supplierId: z.string().uuid(),
  locationId: z.string().uuid(),
  status: z.enum(['draft', 'sent', 'received', 'partial', 'cancelled']),
  supplierStatus: z.enum(['pending', 'confirmed', 'rejected', 'shipped']).default('pending'),
  subtotalCost: z.string().optional(),
  taxTotal: z.string().optional(),
  totalCost: z.string(),
  expectedDeliveryDate: z.string().nullable().optional(),
  supplierExpectedDeliveryDate: z.string().nullable().optional(),
  supplierNotes: z.string().nullable().optional(),
  deliveryDocuments: z.array(deliveryDocumentSchema).default([]),
  sentAt: z.string().nullable().optional(),
  confirmedAt: z.string().nullable().optional(),
  rejectedAt: z.string().nullable().optional(),
  shippedAt: z.string().nullable().optional(),
  receivedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  supplier: z.object({ id: z.string().uuid(), name: z.string() }).optional(),
  location: z.object({ id: z.string().uuid(), name: z.string() }).optional(),
  items: z.array(purchaseOrderItemSchema).default([]),
});

export const procurementAnalyticsSchema = z.object({
  totalSuppliers: z.number(),
  activeSuppliers: z.number(),
  openPurchaseOrders: z.number(),
  delayedOrders: z.number(),
  onTimeDeliveryRate: z.number(),
  topSuppliers: z.array(z.object({
    supplierId: z.string().uuid(),
    name: z.string(),
    itemsSupplied: z.number(),
    purchaseOrders: z.number(),
    confirmedOrders: z.number().optional(),
    shippedOrders: z.number().optional(),
    onTimeDeliveryRate: z.number().optional(),
    averageLeadTimeDays: z.number().optional(),
    rejectionRate: z.number().optional(),
    volume: z.string(),
  })),
});

export type Supplier = z.infer<typeof supplierSchema>;
export type SupplierItem = z.infer<typeof supplierItemSchema>;
export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>;
export type PurchaseOrderItem = z.infer<typeof purchaseOrderItemSchema>;
export type ProcurementAnalytics = z.infer<typeof procurementAnalyticsSchema>;

export async function listSuppliers(api: ApiClient): Promise<Supplier[]> {
  const data = await api.getData<unknown[]>('suppliers/list');
  return z.array(supplierSchema).parse(data);
}

export async function createSupplier(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('suppliers/create', body);
  return supplierSchema.parse(data);
}

export async function updateSupplier(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('suppliers/update', body);
  return supplierSchema.parse(data);
}

export async function disableSupplier(api: ApiClient, id: string) {
  const data = await api.postData<unknown>(`suppliers/${id}/disable`, {});
  return supplierSchema.parse(data);
}

export async function listPurchaseOrders(api: ApiClient): Promise<PurchaseOrder[]> {
  const data = await api.getData<unknown[]>('purchase-orders/list');
  return z.array(purchaseOrderSchema).parse(data);
}

export async function createPurchaseOrder(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('purchase-orders/create', body);
  return purchaseOrderSchema.parse(data);
}

export async function updatePurchaseOrder(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('purchase-orders/update', body);
  return purchaseOrderSchema.parse(data);
}

export async function receivePurchaseOrder(api: ApiClient, body: Record<string, unknown>) {
  const data = await api.postData<unknown>('purchase-orders/receive', body);
  return purchaseOrderSchema.parse(data);
}

export async function getProcurementAnalytics(api: ApiClient): Promise<ProcurementAnalytics> {
  const data = await api.getData<unknown>('purchase-orders/analytics');
  return procurementAnalyticsSchema.parse(data);
}
