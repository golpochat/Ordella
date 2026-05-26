import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const supportMessageSchema = z.object({
  id: z.string().uuid(),
  authorType: z.string(),
  authorUserId: z.string().uuid().nullable(),
  authorCustomerId: z.string().uuid().nullable(),
  body: z.string(),
  internalOnly: z.boolean(),
  attachments: z.array(z.record(z.unknown())).default([]),
  createdAt: z.string(),
});

const supportTicketSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  orderId: z.string().uuid().nullable(),
  deliveryTaskId: z.string().uuid().nullable().optional(),
  subscriptionId: z.string().uuid().nullable(),
  subject: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  priority: z.string(),
  status: z.string(),
  assignedToId: z.string().uuid().nullable(),
  firstResponseDueAt: z.string().nullable(),
  firstRespondedAt: z.string().nullable(),
  slaDueAt: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  closedAt: z.string().nullable(),
  csatRating: z.number().nullable(),
  attachments: z.array(z.record(z.unknown())).default([]),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
  customer: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
  }).optional(),
  assignedTo: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string(),
  }).nullable().optional(),
  messages: z.array(supportMessageSchema).default([]),
  sla: z.object({
    breached: z.boolean(),
    firstResponseBreached: z.boolean(),
    escalated: z.boolean(),
  }).optional(),
});

const supportAnalyticsSchema = z.object({
  totalTickets: z.number(),
  openTickets: z.number(),
  averageResolutionHours: z.number(),
  slaCompliance: z.number(),
  volumeByCategory: z.array(z.object({ category: z.string(), count: z.number() })),
  staffPerformance: z.array(z.object({
    staffId: z.string(),
    staffName: z.string(),
    assigned: z.number(),
    resolved: z.number(),
    averageResolutionHours: z.number(),
  })),
  csatAverage: z.number().nullable(),
});

const cannedResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
});

export type SupportTicket = z.infer<typeof supportTicketSchema>;
export type SupportAnalytics = z.infer<typeof supportAnalyticsSchema>;
export type CannedResponse = z.infer<typeof cannedResponseSchema>;

export async function listSupportTickets(api: ApiClient, params?: Record<string, string | undefined>) {
  const data = await api.getData<unknown[]>('support/tickets', { params });
  return z.array(supportTicketSchema).parse(data);
}

export async function fetchSupportAnalytics(api: ApiClient) {
  const data = await api.getData<unknown>('support/tickets/analytics');
  return supportAnalyticsSchema.parse(data);
}

export async function listCannedResponses(api: ApiClient) {
  const data = await api.getData<unknown[]>('support/tickets/canned-responses');
  return z.array(cannedResponseSchema).parse(data);
}

export async function updateSupportTicket(api: ApiClient, id: string, body: {
  status?: string;
  priority?: string;
  assignedTo?: string;
}) {
  const data = await api.patch<{ success: boolean; data: unknown }>(`support/tickets/${id}`, body);
  return supportTicketSchema.parse((data as { data: unknown }).data);
}

export async function addSupportMessage(api: ApiClient, id: string, body: {
  body: string;
  internalOnly?: boolean;
  attachments?: Array<Record<string, unknown>>;
}) {
  const data = await api.postData<unknown>(`support/tickets/${id}/messages`, body);
  return supportTicketSchema.parse(data);
}
