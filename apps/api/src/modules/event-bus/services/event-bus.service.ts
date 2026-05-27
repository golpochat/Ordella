import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, MoreThan, Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import { NotificationsService } from '../../notifications/services';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import { PublishEventDto, PublishEventsDto, ReplayEventsDto, SubscribeTopicDto } from '../dto';
import {
  EventConsumerOffsetEntity,
  EventDeadLetterEntity,
  EventSchemaEntity,
  EventStoreRecordEntity,
  EventStreamMetricEntity,
  EventSubscriptionEntity,
  EventTopicEntity,
  EventTopicKey,
} from '../entities';

const DEFAULT_TOPICS: Array<{ topicKey: EventTopicKey; displayName: string; description: string; permissions: string[] }> = [
  { topicKey: 'orders', displayName: 'Orders', description: 'POS, storefront, and order lifecycle events', permissions: ['event-bus.publish.orders', 'event-bus.read.orders'] },
  { topicKey: 'inventory', displayName: 'Inventory', description: 'Stock movements, adjustments, and warehouse events', permissions: ['event-bus.publish.inventory', 'event-bus.read.inventory'] },
  { topicKey: 'customers', displayName: 'Customers', description: 'CRM, loyalty, and customer behavior events', permissions: ['event-bus.publish.customers', 'event-bus.read.customers'] },
  { topicKey: 'delivery', displayName: 'Delivery', description: 'Driver tasks, tracking, and fulfillment events', permissions: ['event-bus.publish.delivery', 'event-bus.read.delivery'] },
  { topicKey: 'payments', displayName: 'Payments', description: 'Payment capture, refunds, and settlement events', permissions: ['event-bus.publish.payments', 'event-bus.read.payments'] },
  { topicKey: 'iot', displayName: 'IoT', description: 'Hardware sensors, devices, and automation events', permissions: ['event-bus.publish.iot', 'event-bus.read.iot'] },
];

const DEFAULT_CONSUMERS: Array<{ topicKey: EventTopicKey; consumerGroup: string; consumerType: EventSubscriptionEntity['consumerType'] }> = [
  { topicKey: 'orders', consumerGroup: 'analytics-orders', consumerType: 'analytics' },
  { topicKey: 'orders', consumerGroup: 'notifications-orders', consumerType: 'notifications' },
  { topicKey: 'inventory', consumerGroup: 'inventory-realtime', consumerType: 'inventory' },
  { topicKey: 'inventory', consumerGroup: 'ai-assistant-inventory', consumerType: 'ai_assistant' },
  { topicKey: 'customers', consumerGroup: 'marketing-behavior', consumerType: 'marketing' },
  { topicKey: 'delivery', consumerGroup: 'delivery-tracking', consumerType: 'delivery' },
  { topicKey: 'delivery', consumerGroup: 'integrations-delivery', consumerType: 'integrations' },
  { topicKey: 'payments', consumerGroup: 'notifications-payments', consumerType: 'notifications' },
  { topicKey: 'iot', consumerGroup: 'ai-assistant-iot', consumerType: 'ai_assistant' },
  { topicKey: 'iot', consumerGroup: 'integrations-iot', consumerType: 'integrations' },
];

@Injectable()
export class EventBusService {
  constructor(
    @InjectRepository(EventTopicEntity)
    private readonly topics: Repository<EventTopicEntity>,
    @InjectRepository(EventSchemaEntity)
    private readonly schemas: Repository<EventSchemaEntity>,
    @InjectRepository(EventStoreRecordEntity)
    private readonly store: Repository<EventStoreRecordEntity>,
    @InjectRepository(EventSubscriptionEntity)
    private readonly subscriptions: Repository<EventSubscriptionEntity>,
    @InjectRepository(EventConsumerOffsetEntity)
    private readonly offsets: Repository<EventConsumerOffsetEntity>,
    @InjectRepository(EventDeadLetterEntity)
    private readonly deadLetters: Repository<EventDeadLetterEntity>,
    @InjectRepository(EventStreamMetricEntity)
    private readonly metrics: Repository<EventStreamMetricEntity>,
    private readonly auditLogs: AuditLogService,
    private readonly notifications: NotificationsService,
  ) {}

  async ensureDefaults(tenantId: string) {
    for (const topic of DEFAULT_TOPICS) {
      const existing = await this.topics.findOne({ where: { tenantId, topicKey: topic.topicKey } });
      if (!existing) {
        await this.topics.save(this.topics.create({ tenantId, ...topic, partitionCount: 8, retentionDays: 30, isActive: true, metadata: {} }));
        await this.schemas.save(this.schemas.create({
          tenantId,
          topicKey: topic.topicKey,
          version: 1,
          eventType: `${topic.topicKey}.v1`,
          schemaJson: { type: 'object', additionalProperties: true },
          isActive: true,
        }));
      }
    }
    for (const consumer of DEFAULT_CONSUMERS) {
      const existing = await this.subscriptions.findOne({
        where: { tenantId, topicKey: consumer.topicKey, consumerGroup: consumer.consumerGroup },
      });
      if (!existing) {
        const subscription = await this.subscriptions.save(this.subscriptions.create({
          tenantId,
          topicKey: consumer.topicKey,
          consumerGroup: consumer.consumerGroup,
          consumerType: consumer.consumerType,
          filterRules: {},
          deliverySemantics: 'at_least_once',
          isActive: true,
          maxRetries: 5,
        }));
        await this.offsets.save(this.offsets.create({
          tenantId,
          subscriptionId: subscription.id,
          lastSequence: '0',
          lagCount: 0,
          processedCount: 0,
          idempotencyKeys: [],
        }));
      }
    }
  }

  async listTopics(tenant: TenantContext) {
    await this.ensureDefaults(tenant.tenantId);
    return this.topics.find({ where: { tenantId: tenant.tenantId }, order: { topicKey: 'ASC' } });
  }

  async publish(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: PublishEventDto) {
    return this.publishBatch(tenant, user, { events: [dto] });
  }

  async publishBatch(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: PublishEventsDto) {
    await this.ensureDefaults(tenant.tenantId);
    const results = [];
    for (const event of dto.events) {
      results.push(await this.appendAndDispatch(tenant, user, event));
    }
    return { results, publishedAt: new Date().toISOString() };
  }

  async subscribe(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: SubscribeTopicDto) {
    await this.ensureDefaults(tenant.tenantId);
    let subscription = await this.subscriptions.findOne({
      where: { tenantId: tenant.tenantId, topicKey: dto.topicKey, consumerGroup: dto.consumerGroup },
    });
    subscription ??= this.subscriptions.create({ tenantId: tenant.tenantId, topicKey: dto.topicKey, consumerGroup: dto.consumerGroup, consumerType: dto.consumerType });
    subscription.consumerType = dto.consumerType;
    subscription.filterRules = dto.filterRules ?? {};
    subscription.deliverySemantics = dto.deliverySemantics ?? 'at_least_once';
    subscription.maxRetries = dto.maxRetries ?? 5;
    subscription.isActive = true;
    subscription.updatedAt = new Date();
    const saved = await this.subscriptions.save(subscription);
    const offset = await this.offsets.findOne({ where: { tenantId: tenant.tenantId, subscriptionId: saved.id } });
    if (!offset) {
      await this.offsets.save(this.offsets.create({
        tenantId: tenant.tenantId,
        subscriptionId: saved.id,
        lastSequence: '0',
        lagCount: 0,
        processedCount: 0,
        idempotencyKeys: [],
      }));
    }
    await this.audit(tenant, user, 'event_bus.subscription_created', 'event_subscription', saved.id, { topicKey: dto.topicKey, consumerGroup: dto.consumerGroup });
    return saved;
  }

  async stream(tenant: TenantContext, topicKey: string, cursor?: string, limit = 100) {
    const since = cursor ? new Date(Number(cursor)) : undefined;
    const records = await this.store.find({
      where: {
        tenantId: tenant.tenantId,
        topicKey,
        ...(since ? { createdAt: MoreThan(since) } : {}),
      },
      order: { sequenceNumber: 'DESC' },
      take: limit,
    });
    return { cursor: Date.now().toString(), events: records };
  }

  async getEvent(tenant: TenantContext, eventId: string) {
    const record = await this.store.findOne({ where: { tenantId: tenant.tenantId, eventId } });
    if (!record) throw new NotFoundException('Event not found');
    await this.audit(tenant, undefined, 'event_bus.event_inspected', 'event_store_record', record.id, { eventId });
    return record;
  }

  async replay(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: ReplayEventsDto) {
    const from = dto.fromSequence ? BigInt(dto.fromSequence) : BigInt(0);
    const to = dto.toSequence ? BigInt(dto.toSequence) : BigInt(Number.MAX_SAFE_INTEGER);
    const records = await this.store
      .createQueryBuilder('event')
      .where('event.tenant_id = :tenantId', { tenantId: tenant.tenantId })
      .andWhere('event.topic_key = :topicKey', { topicKey: dto.topicKey })
      .andWhere('event.sequence_number >= :from', { from: from.toString() })
      .andWhere('event.sequence_number <= :to', { to: to.toString() })
      .orderBy('event.sequence_number', 'ASC')
      .getMany();

    const subscriptions = dto.consumerGroup
      ? await this.subscriptions.find({ where: { tenantId: tenant.tenantId, topicKey: dto.topicKey, consumerGroup: dto.consumerGroup, isActive: true } })
      : await this.subscriptions.find({ where: { tenantId: tenant.tenantId, topicKey: dto.topicKey, isActive: true } });

    let replayed = 0;
    for (const record of records) {
      for (const subscription of subscriptions) {
        await this.deliverToConsumer(tenant, subscription, record, true);
        replayed += 1;
      }
    }
    await this.audit(tenant, user, 'event_bus.replay', 'event_topic', null, { topicKey: dto.topicKey, replayed, eventCount: records.length });
    return { replayed, eventCount: records.length };
  }

  async dashboard(tenant: TenantContext) {
    await this.ensureDefaults(tenant.tenantId);
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const [topics, recentEvents, offsets, deadLetterCount, windowMetrics] = await Promise.all([
      this.topics.find({ where: { tenantId: tenant.tenantId } }),
      this.store.count({ where: { tenantId: tenant.tenantId, createdAt: MoreThan(since) } }),
      this.offsets.find({ where: { tenantId: tenant.tenantId } }),
      this.deadLetters.count({ where: { tenantId: tenant.tenantId, status: 'open' } }),
      this.metrics.find({ where: { tenantId: tenant.tenantId, windowStart: MoreThan(since) }, order: { windowStart: 'DESC' }, take: 24 }),
    ]);

    const subscriptionRows = await this.subscriptions.find({ where: { tenantId: tenant.tenantId, isActive: true } });
    const consumerLag = await Promise.all(subscriptionRows.map(async (subscription) => {
      const offset = offsets.find((row) => row.subscriptionId === subscription.id);
      const latest = await this.latestSequence(tenant.tenantId, subscription.topicKey);
      const lag = Math.max(0, Number(latest) - Number(offset?.lastSequence ?? 0));
      return {
        subscriptionId: subscription.id,
        topicKey: subscription.topicKey,
        consumerGroup: subscription.consumerGroup,
        consumerType: subscription.consumerType,
        lag,
        processedCount: offset?.processedCount ?? 0,
        lastProcessedAt: offset?.lastProcessedAt ?? null,
      };
    }));

    return {
      topicCount: topics.length,
      eventsLastHour: recentEvents,
      throughputPerMinute: Math.round(recentEvents / 60),
      openDeadLetters: deadLetterCount,
      consumerLag,
      windowMetrics,
      transportSecurity: { encrypted: true, protocol: 'tls' },
    };
  }

  async listDeadLetters(tenant: TenantContext, topicKey?: string) {
    const letters = await this.deadLetters.find({
      where: { tenantId: tenant.tenantId, status: 'open' },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    if (!topicKey) return letters;
    const eventIds = letters.map((letter) => letter.eventId);
    if (!eventIds.length) return [];
    const records = await this.store.find({ where: { tenantId: tenant.tenantId, eventId: In(eventIds), topicKey } });
    const allowed = new Set(records.map((record) => record.eventId));
    return letters.filter((letter) => allowed.has(letter.eventId));
  }

  async updateTopicPermissions(tenant: TenantContext, user: AuthenticatedUser | undefined, topicId: string, permissions: string[]) {
    const topic = await this.topics.findOne({ where: { id: topicId, tenantId: tenant.tenantId } });
    if (!topic) throw new NotFoundException('Topic not found');
    topic.permissions = permissions;
    topic.updatedAt = new Date();
    const saved = await this.topics.save(topic);
    await this.audit(tenant, user, 'event_bus.topic_permissions_updated', 'event_topic', saved.id, { permissions });
    return saved;
  }

  private async appendAndDispatch(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: PublishEventDto) {
    const topic = await this.topics.findOne({ where: { tenantId: tenant.tenantId, topicKey: dto.topicKey, isActive: true } });
    if (!topic) throw new BadRequestException(`Topic ${dto.topicKey} is not active`);

    const duplicate = await this.store.findOne({ where: { tenantId: tenant.tenantId, eventId: dto.eventId } });
    if (duplicate) {
      return { eventId: dto.eventId, status: 'duplicate', sequenceNumber: duplicate.sequenceNumber, recordId: duplicate.id };
    }

    const partitionKey = dto.partitionKey ?? dto.locationId ?? tenant.tenantId;
    const sequenceNumber = (await this.nextSequence(tenant.tenantId, dto.topicKey)).toString();
    const record = await this.store.save(this.store.create({
      tenantId: tenant.tenantId,
      eventId: dto.eventId,
      topicKey: dto.topicKey,
      partitionKey,
      sequenceNumber,
      eventType: dto.eventType,
      schemaVersion: dto.schemaVersion ?? 1,
      producer: dto.producer,
      payload: dto.payload,
      metadata: { ...(dto.metadata ?? {}), publishedBy: user?.id ?? null },
      locationId: dto.locationId ?? null,
      occurredAt: new Date(dto.occurredAt),
    }));

    await this.updateStreamWindow(tenant.tenantId, dto.topicKey, record);
    const activeSubscriptions = await this.subscriptions.find({
      where: { tenantId: tenant.tenantId, topicKey: dto.topicKey, isActive: true },
    });
    const deliveries = [];
    for (const subscription of activeSubscriptions) {
      deliveries.push(await this.deliverToConsumer(tenant, subscription, record, false));
    }
    await this.audit(tenant, user, 'event_bus.published', 'event_store_record', record.id, { topicKey: dto.topicKey, eventId: dto.eventId, sequenceNumber });
    return { eventId: dto.eventId, status: 'published', sequenceNumber, recordId: record.id, deliveries };
  }

  private async deliverToConsumer(
    tenant: TenantContext,
    subscription: EventSubscriptionEntity,
    record: EventStoreRecordEntity,
    replay: boolean,
  ) {
    const offset = await this.offsets.findOne({ where: { tenantId: tenant.tenantId, subscriptionId: subscription.id } });
    if (!offset) return { subscriptionId: subscription.id, status: 'skipped' };

    const idempotencyKey = `${subscription.id}:${record.eventId}`;
    if (subscription.deliverySemantics === 'exactly_once' && offset.idempotencyKeys.includes(idempotencyKey)) {
      return { subscriptionId: subscription.id, status: 'duplicate_skipped' };
    }

    try {
      await this.routeToIntegration(subscription.consumerType, tenant, record);
      offset.lastSequence = record.sequenceNumber;
      offset.processedCount += 1;
      offset.lagCount = Math.max(0, Number(await this.latestSequence(tenant.tenantId, record.topicKey)) - Number(record.sequenceNumber));
      offset.lastProcessedAt = new Date();
      if (subscription.deliverySemantics === 'exactly_once') {
        offset.idempotencyKeys = [...offset.idempotencyKeys.slice(-500), idempotencyKey];
      }
      offset.updatedAt = new Date();
      await this.offsets.save(offset);
      return { subscriptionId: subscription.id, status: replay ? 'replayed' : 'delivered', consumerType: subscription.consumerType };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Consumer delivery failed';
      const attempts = await this.deadLetters.count({ where: { tenantId: tenant.tenantId, subscriptionId: subscription.id, eventId: record.eventId } });
      if (attempts + 1 >= subscription.maxRetries) {
        await this.deadLetters.save(this.deadLetters.create({
          tenantId: tenant.tenantId,
          subscriptionId: subscription.id,
          eventId: record.eventId,
          storeRecordId: record.id,
          status: 'open',
          attempts: attempts + 1,
          errorMessage: message,
          payload: record.payload,
        }));
        return { subscriptionId: subscription.id, status: 'dead_letter', error: message };
      }
      return { subscriptionId: subscription.id, status: 'retry_scheduled', error: message, attempt: attempts + 1 };
    }
  }

  private async routeToIntegration(consumerType: EventSubscriptionEntity['consumerType'], tenant: TenantContext, record: EventStoreRecordEntity) {
    const hooks: Record<EventSubscriptionEntity['consumerType'], () => Promise<void>> = {
      analytics: async () => undefined,
      ai_assistant: async () => undefined,
      notifications: async () => {
        if (record.topicKey === 'orders' || record.topicKey === 'payments') {
          await this.notifications.dispatchEvent(
            tenant.tenantId,
            record.eventType,
            { eventId: record.eventId, topicKey: record.topicKey, ...record.payload },
            { channel: NotificationChannelType.IN_APP, type: NotificationType.SYSTEM },
          ).catch(() => undefined);
        }
      },
      integrations: async () => undefined,
      marketing: async () => undefined,
      inventory: async () => undefined,
      delivery: async () => undefined,
    };
    await hooks[consumerType]();
  }

  private async updateStreamWindow(tenantId: string, topicKey: string, record: EventStoreRecordEntity) {
    const windowMs = 5 * 60 * 1000;
    const windowStart = new Date(Math.floor(record.createdAt.getTime() / windowMs) * windowMs);
    const windowEnd = new Date(windowStart.getTime() + windowMs);
    let metric = await this.metrics.findOne({ where: { tenantId, topicKey, windowStart } });
    metric ??= this.metrics.create({ tenantId, topicKey, windowStart, windowEnd, eventCount: 0, bytesEstimate: 0, aggregates: {} });
    metric.eventCount += 1;
    metric.bytesEstimate += JSON.stringify(record.payload).length;
    const previous = await this.metrics.find({
      where: { tenantId, topicKey, windowStart: Between(new Date(Date.now() - 60 * 60 * 1000), windowStart) },
      order: { windowStart: 'DESC' },
      take: 12,
    });
    const average = previous.length ? previous.reduce((sum, row) => sum + row.eventCount, 0) / previous.length : metric.eventCount;
    if (average > 0 && metric.eventCount > average * 3) {
      metric.anomalyScore = '0.9000';
      metric.aggregates = { ...metric.aggregates, anomaly: 'spike_detected' };
    }
    await this.metrics.save(metric);
  }

  private async nextSequence(tenantId: string, topicKey: string) {
    const latest = await this.latestSequence(tenantId, topicKey);
    return latest + BigInt(1);
  }

  private async latestSequence(tenantId: string, topicKey: string) {
    const row = await this.store
      .createQueryBuilder('event')
      .select('MAX(event.sequence_number)', 'max')
      .where('event.tenant_id = :tenantId', { tenantId })
      .andWhere('event.topic_key = :topicKey', { topicKey })
      .getRawOne<{ max: string | null }>();
    return BigInt(row?.max ?? 0);
  }

  private async audit(tenant: TenantContext, user: AuthenticatedUser | undefined, action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown>) {
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id ?? null,
      action,
      entityType,
      entityId,
      source: 'event_bus',
      riskLevel: action.includes('replay') ? 'high' : 'medium',
      metadata,
    });
  }
}
