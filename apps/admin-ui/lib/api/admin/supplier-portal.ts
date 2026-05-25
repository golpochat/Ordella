import type { ApiClient } from '@shared-utils';
import { z } from 'zod';
import { purchaseOrderSchema, supplierSchema } from './procurement';

const supplierMessageSchema = z.object({
  id: z.string().uuid(),
  supplierId: z.string().uuid(),
  tenantId: z.string().uuid(),
  purchaseOrderId: z.string().uuid().nullable().optional(),
  senderType: z.enum(['supplier', 'merchant']),
  message: z.string(),
  createdAt: z.string(),
  supplier: supplierSchema.optional(),
  purchaseOrder: purchaseOrderSchema.nullable().optional(),
});

const supplierPerformanceSchema = z.object({
  supplierId: z.string().uuid(),
  name: z.string(),
  portalEnabled: z.boolean(),
  purchaseOrders: z.number(),
  confirmations: z.number(),
  delays: z.number(),
  onTimeDeliveryRate: z.number(),
  fillRate: z.number(),
});

const supplierPortalOverviewSchema = z.object({
  suppliers: z.array(supplierSchema.extend({
    portalEnabled: z.boolean(),
    itemsSupplied: z.number(),
  })),
  confirmations: z.array(purchaseOrderSchema),
  messages: z.array(supplierMessageSchema),
  performance: z.array(supplierPerformanceSchema),
});

export type SupplierMessage = z.infer<typeof supplierMessageSchema>;
export type SupplierPortalOverview = z.infer<typeof supplierPortalOverviewSchema>;

export async function getSupplierPortalOverview(api: ApiClient): Promise<SupplierPortalOverview> {
  const data = await api.getData<unknown>('supplier/admin/overview');
  return supplierPortalOverviewSchema.parse(data);
}

export async function sendSupplierPortalMessage(api: ApiClient, supplierId: string, body: Record<string, unknown>): Promise<SupplierMessage> {
  const data = await api.postData<unknown>(`supplier/admin/${supplierId}/messages/send`, body);
  return supplierMessageSchema.parse(data);
}
