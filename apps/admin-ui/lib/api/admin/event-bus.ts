import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const topicSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  topicKey: z.string(),
  displayName: z.string(),
  description: z.string().nullable(),
  partitionCount: z.number(),
  retentionDays: z.number(),
  isActive: z.boolean(),
  permissions: z.array(z.string()),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const eventRecordSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  eventId: z.string(),
  topicKey: z.string(),
  partitionKey: z.string(),
  sequenceNumber: z.string(),
  eventType: z.string(),
  schemaVersion: z.number(),
  producer: z.string(),
  payload: z.record(z.unknown()),
  metadata: z.record(z.unknown()),
  locationId: z.string().uuid().nullable(),
  occurredAt: z.string(),
  createdAt: z.string(),
});

const consumerLagSchema = z.object({
  subscriptionId: z.string().uuid(),
  topicKey: z.string(),
  consumerGroup: z.string(),
  consumerType: z.string(),
  lag: z.number(),
  processedCount: z.number(),
  lastProcessedAt: z.string().nullable(),
});

const dashboardSchema = z.object({
  topicCount: z.number(),
  eventsLastHour: z.number(),
  throughputPerMinute: z.number(),
  openDeadLetters: z.number(),
  consumerLag: z.array(consumerLagSchema),
  windowMetrics: z.array(z.object({
    id: z.string().uuid(),
    topicKey: z.string(),
    windowStart: z.string(),
    windowEnd: z.string(),
    eventCount: z.number(),
    bytesEstimate: z.number(),
    anomalyScore: z.string().nullable(),
    aggregates: z.record(z.unknown()),
  })),
  transportSecurity: z.object({ encrypted: z.boolean(), protocol: z.string() }),
});

const deadLetterSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  eventId: z.string(),
  storeRecordId: z.string().uuid(),
  status: z.string(),
  attempts: z.number(),
  errorMessage: z.string(),
  payload: z.record(z.unknown()),
  createdAt: z.string(),
});

export type EventTopic = z.infer<typeof topicSchema>;
export type EventRecord = z.infer<typeof eventRecordSchema>;
export type EventBusDashboard = z.infer<typeof dashboardSchema>;
export type EventDeadLetter = z.infer<typeof deadLetterSchema>;

export async function getEventBusDashboard(api: ApiClient) {
  return dashboardSchema.parse(await api.getData<unknown>('event-bus/dashboard'));
}

export async function listEventTopics(api: ApiClient) {
  return z.array(topicSchema).parse(await api.getData<unknown>('event-bus/topics'));
}

export async function getEventStream(api: ApiClient, topicKey: string, cursor?: string) {
  return z.object({
    cursor: z.string(),
    events: z.array(eventRecordSchema),
  }).parse(await api.getData<unknown>(`event-bus/streams/${topicKey}`, { params: cursor ? { cursor } : undefined }));
}

export async function getEventById(api: ApiClient, eventId: string) {
  return eventRecordSchema.parse(await api.getData<unknown>(`event-bus/events/${eventId}`));
}

export async function replayEvents(api: ApiClient, body: { topicKey: string; fromSequence?: string; toSequence?: string; consumerGroup?: string }) {
  return z.object({ replayed: z.number(), eventCount: z.number() }).parse(await api.postData<unknown>('event-bus/replay', body));
}

export async function listEventDeadLetters(api: ApiClient, topicKey?: string) {
  return z.array(deadLetterSchema).parse(await api.getData<unknown>('event-bus/dead-letters', { params: topicKey ? { topicKey } : undefined }));
}
