import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const aiConversationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  createdByUserId: z.string().uuid().nullable(),
  title: z.string(),
  context: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const aiMessageSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  conversationId: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
});

const aiActionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  conversationId: z.string().uuid().nullable(),
  createdByUserId: z.string().uuid().nullable(),
  actionType: z.string(),
  status: z.string(),
  riskLevel: z.string(),
  payload: z.record(z.unknown()),
  approvalNote: z.string().nullable(),
  approvedByUserId: z.string().uuid().nullable(),
  approvedAt: z.string().nullable(),
  executedAt: z.string().nullable(),
  createdAt: z.string(),
});

const aiInsightSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  category: z.string(),
  severity: z.string(),
  title: z.string(),
  summary: z.string(),
  recommendedAction: z.string().nullable(),
  metadata: z.record(z.unknown()),
  status: z.string(),
  createdAt: z.string(),
});

const automationSettingSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  automationType: z.string(),
  isEnabled: z.boolean(),
  requiresApproval: z.boolean(),
  thresholds: z.record(z.unknown()),
  updatedAt: z.string(),
});

const analyticsSchema = z.object({
  usageCount: z.number(),
  actionApprovalRate: z.number(),
  automationImpact: z.object({
    actionsProposed: z.number(),
    actionsExecuted: z.number(),
    openInsights: z.number(),
  }),
  accuracy: z.number().nullable(),
  costSavingsCents: z.number(),
  metrics: z.array(z.unknown()),
});

const chatResponseSchema = z.object({
  conversation: aiConversationSchema,
  userMessage: aiMessageSchema,
  assistantMessage: aiMessageSchema,
  proposedActions: z.array(aiActionSchema),
  suggestedPrompts: z.array(z.string()),
  followUps: z.array(z.string()),
});

export type AiConversation = z.infer<typeof aiConversationSchema>;
export type AiMessage = z.infer<typeof aiMessageSchema>;
export type AiAction = z.infer<typeof aiActionSchema>;
export type AiInsight = z.infer<typeof aiInsightSchema>;
export type AiAutomationSetting = z.infer<typeof automationSettingSchema>;
export type AiAnalytics = z.infer<typeof analyticsSchema>;
export type AiChatResponse = z.infer<typeof chatResponseSchema>;

export async function listAiConversations(api: ApiClient) {
  return z.array(aiConversationSchema).parse(await api.getData<unknown>('ai-assistant/conversations'));
}

export async function listAiMessages(api: ApiClient, conversationId: string) {
  return z.array(aiMessageSchema).parse(await api.getData<unknown>(`ai-assistant/conversations/${conversationId}/messages`));
}

export async function sendAiMessage(api: ApiClient, body: { conversationId?: string; message: string }) {
  return chatResponseSchema.parse(await api.postData<unknown>('ai-assistant/chat', body));
}

export async function listAiInsights(api: ApiClient) {
  return z.array(aiInsightSchema).parse(await api.getData<unknown>('ai-assistant/insights'));
}

export async function generateAiInsights(api: ApiClient) {
  return z.array(aiInsightSchema).parse(await api.postData<unknown>('ai-assistant/insights/generate', {}));
}

export async function listAiActions(api: ApiClient) {
  return z.array(aiActionSchema).parse(await api.getData<unknown>('ai-assistant/actions'));
}

export async function reviewAiAction(api: ApiClient, id: string, status: 'approved' | 'rejected', note?: string) {
  return aiActionSchema.parse(await api.postData<unknown>(`ai-assistant/actions/${id}/review`, { status, note }));
}

export async function listAiAutomationSettings(api: ApiClient) {
  return z.array(automationSettingSchema).parse(await api.getData<unknown>('ai-assistant/automation-settings'));
}

export async function updateAiAutomationSetting(
  api: ApiClient,
  body: { automationType: string; isEnabled: boolean; requiresApproval: boolean; thresholds?: Record<string, unknown> },
) {
  return automationSettingSchema.parse(await api.postData<unknown>('ai-assistant/automation-settings', body));
}

export async function getAiAnalytics(api: ApiClient) {
  return analyticsSchema.parse(await api.getData<unknown>('ai-assistant/analytics'));
}
