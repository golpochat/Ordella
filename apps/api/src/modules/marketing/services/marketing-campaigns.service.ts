import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { CustomerEntity } from '../../loyalty/entities';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import { NotificationsService } from '../../notifications/services/notifications.service';
import {
  CreateMarketingCampaignDto,
  TrackMarketingEventDto,
  UpdateMarketingCampaignDto,
  UpsertMarketingJourneyDto,
} from '../dto';
import {
  MarketingBehaviorEventEntity,
  MarketingCampaignAutomationType,
  MarketingCampaignEntity,
  MarketingCampaignLogEntity,
  MarketingCampaignLogStatus,
  MarketingCampaignStatus,
  MarketingCampaignType,
  MarketingJourneyEntity,
  MarketingScheduleType,
  MarketingSegmentEntity,
} from '../entities';
import { MarketingSegmentsService } from './marketing-segments.service';

@Injectable()
export class MarketingCampaignsService {
  constructor(
    @InjectRepository(MarketingCampaignEntity)
    private readonly campaigns: Repository<MarketingCampaignEntity>,
    @InjectRepository(MarketingCampaignLogEntity)
    private readonly logs: Repository<MarketingCampaignLogEntity>,
    @InjectRepository(MarketingBehaviorEventEntity)
    private readonly behaviorEvents: Repository<MarketingBehaviorEventEntity>,
    @InjectRepository(MarketingJourneyEntity)
    private readonly journeys: Repository<MarketingJourneyEntity>,
    @InjectRepository(MarketingSegmentEntity)
    private readonly segments: Repository<MarketingSegmentEntity>,
    private readonly marketingSegments: MarketingSegmentsService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(tenant: TenantContext) {
    const campaigns = await this.campaigns.find({
      where: { tenantId: tenant.tenantId },
      relations: { segment: true, logs: true },
      order: { createdAt: 'DESC' },
    });
    return campaigns.map((campaign) => this.toResponse(campaign));
  }

  async get(tenant: TenantContext, id: string) {
    return this.toResponse(await this.requireCampaign(tenant.tenantId, id));
  }

  async create(tenant: TenantContext, dto: CreateMarketingCampaignDto) {
    await this.requireSegment(tenant.tenantId, dto.segmentId);
    const scheduleAt = dto.scheduleAt ? new Date(dto.scheduleAt) : null;
    const campaign = await this.campaigns.save(this.campaigns.create({
      tenantId: tenant.tenantId,
      name: dto.name.trim(),
      type: dto.type,
      campaignType: dto.campaignType ?? MarketingCampaignAutomationType.BROADCAST,
      channels: dto.channels?.length ? dto.channels : [dto.type],
      segmentId: dto.segmentId,
      subject: dto.type === MarketingCampaignType.EMAIL ? dto.subject?.trim() ?? null : null,
      message: dto.message,
      scheduleAt,
      scheduleType: dto.scheduleType ?? MarketingScheduleType.ONE_TIME,
      recurrenceRule: dto.recurrenceRule?.trim() || null,
      status: dto.status ?? (scheduleAt ? MarketingCampaignStatus.SCHEDULED : MarketingCampaignStatus.DRAFT),
      campaignCategory: dto.campaignCategory?.trim() || null,
      frequencyCap: dto.frequencyCap ?? 1,
      safetyRules: dto.safetyRules ?? {},
      metadata: dto.metadata ?? {},
    }));
    return this.toResponse(await this.requireCampaign(tenant.tenantId, campaign.id));
  }

  async update(tenant: TenantContext, id: string, dto: UpdateMarketingCampaignDto) {
    const campaign = await this.requireCampaign(tenant.tenantId, id);
    await this.requireSegment(tenant.tenantId, dto.segmentId);
    campaign.name = dto.name.trim();
    campaign.type = dto.type;
    campaign.campaignType = dto.campaignType ?? campaign.campaignType ?? MarketingCampaignAutomationType.BROADCAST;
    campaign.channels = dto.channels?.length ? dto.channels : [dto.type];
    campaign.segmentId = dto.segmentId;
    campaign.subject = dto.type === MarketingCampaignType.EMAIL ? dto.subject?.trim() ?? null : null;
    campaign.message = dto.message;
    campaign.scheduleAt = dto.scheduleAt ? new Date(dto.scheduleAt) : null;
    campaign.scheduleType = dto.scheduleType ?? campaign.scheduleType ?? MarketingScheduleType.ONE_TIME;
    campaign.recurrenceRule = dto.recurrenceRule?.trim() || null;
    campaign.campaignCategory = dto.campaignCategory?.trim() || null;
    campaign.frequencyCap = dto.frequencyCap ?? campaign.frequencyCap ?? 1;
    campaign.safetyRules = dto.safetyRules ?? campaign.safetyRules ?? {};
    campaign.metadata = dto.metadata ?? campaign.metadata ?? {};
    campaign.status = dto.status ?? (campaign.scheduleAt ? MarketingCampaignStatus.SCHEDULED : campaign.status);
    return this.toResponse(await this.campaigns.save(campaign));
  }

  async delete(tenant: TenantContext, id: string): Promise<void> {
    await this.requireCampaign(tenant.tenantId, id);
    await this.campaigns.delete({ id, tenantId: tenant.tenantId });
  }

  async duplicate(tenant: TenantContext, id: string) {
    const campaign = await this.requireCampaign(tenant.tenantId, id);
    const copy = await this.campaigns.save(this.campaigns.create({
      tenantId: tenant.tenantId,
      name: `${campaign.name} copy`,
      type: campaign.type,
      campaignType: campaign.campaignType,
      channels: campaign.channels,
      segmentId: campaign.segmentId,
      subject: campaign.subject,
      message: campaign.message,
      scheduleAt: null,
      status: MarketingCampaignStatus.DRAFT,
      scheduleType: campaign.scheduleType,
      recurrenceRule: campaign.recurrenceRule,
      campaignCategory: campaign.campaignCategory,
      frequencyCap: campaign.frequencyCap,
      safetyRules: campaign.safetyRules,
      metadata: campaign.metadata,
    }));
    return this.toResponse(await this.requireCampaign(tenant.tenantId, copy.id));
  }

  async sendNow(tenant: TenantContext, id: string) {
    const campaign = await this.requireCampaign(tenant.tenantId, id);
    await this.sendCampaign(campaign);
    return this.toResponse(await this.requireCampaign(tenant.tenantId, id));
  }

  async processScheduled(): Promise<number> {
    const due = await this.campaigns.find({
      where: {
        status: MarketingCampaignStatus.SCHEDULED,
        scheduleAt: LessThanOrEqual(new Date()),
      },
      relations: { segment: true },
      take: 25,
    });
    for (const campaign of due) await this.sendCampaign(campaign);
    return due.length;
  }

  async analytics(tenant: TenantContext) {
    const [campaigns, sent, failed, opens, clicks, conversions, unsubscribes, revenue] = await Promise.all([
      this.campaigns.count({ where: { tenantId: tenant.tenantId } }),
      this.logs
        .createQueryBuilder('log')
        .innerJoin(MarketingCampaignEntity, 'campaign', 'campaign.id = log.campaign_id')
        .where('campaign.tenant_id = :tenantId', { tenantId: tenant.tenantId })
        .andWhere('log.status = :status', { status: MarketingCampaignLogStatus.SENT })
        .getCount(),
      this.logs
        .createQueryBuilder('log')
        .innerJoin(MarketingCampaignEntity, 'campaign', 'campaign.id = log.campaign_id')
        .where('campaign.tenant_id = :tenantId', { tenantId: tenant.tenantId })
        .andWhere('log.status = :status', { status: MarketingCampaignLogStatus.FAILED })
        .getCount(),
      this.countTrackedLogs(tenant.tenantId, 'opened_at'),
      this.countTrackedLogs(tenant.tenantId, 'clicked_at'),
      this.countTrackedLogs(tenant.tenantId, 'converted_at'),
      this.countTrackedLogs(tenant.tenantId, 'unsubscribed_at'),
      this.logs
        .createQueryBuilder('log')
        .innerJoin(MarketingCampaignEntity, 'campaign', 'campaign.id = log.campaign_id')
        .select('COALESCE(SUM(log.revenue_attributed), 0)', 'value')
        .where('campaign.tenant_id = :tenantId', { tenantId: tenant.tenantId })
        .getRawOne<{ value: string }>(),
    ]);
    const unsubscribeRate = sent ? Number(((unsubscribes / sent) * 100).toFixed(2)) : 0;
    return {
      campaigns,
      sent,
      failed,
      delivered: sent,
      opens,
      clicks,
      conversions,
      revenueAttribution: revenue?.value ?? '0.00',
      unsubscribeRate,
    };
  }

  async listJourneys(tenant: TenantContext): Promise<MarketingJourneyEntity[]> {
    return this.journeys.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' } });
  }

  async upsertJourney(tenant: TenantContext, dto: UpsertMarketingJourneyDto): Promise<MarketingJourneyEntity> {
    if (dto.targetSegmentId) await this.requireSegment(tenant.tenantId, dto.targetSegmentId);
    const existing = dto.id ? await this.journeys.findOne({ where: { tenantId: tenant.tenantId, id: dto.id } }) : null;
    return this.journeys.save(this.journeys.create({
      ...(existing ?? {}),
      tenantId: tenant.tenantId,
      name: dto.name.trim(),
      trigger: dto.trigger,
      targetSegmentId: dto.targetSegmentId ?? null,
      status: dto.status ?? MarketingCampaignStatus.DRAFT,
      channels: dto.channels,
      frequencyCap: dto.frequencyCap ?? 1,
      steps: dto.steps,
      safetyRules: dto.safetyRules ?? {},
      metadata: dto.metadata ?? {},
    }));
  }

  async trackEvent(tenant: TenantContext, dto: TrackMarketingEventDto): Promise<MarketingBehaviorEventEntity> {
    if (dto.campaignId && dto.customerId) {
      await this.updateTrackingLog(dto.campaignId, dto.customerId, dto.eventType, dto.properties ?? {});
    }
    if (dto.eventType === 'unsubscribe' && dto.customerId) {
      await this.applyUnsubscribe(tenant.tenantId, dto.customerId, dto.properties ?? {});
    }
    return this.behaviorEvents.save(this.behaviorEvents.create({
      tenantId: tenant.tenantId,
      customerId: dto.customerId ?? null,
      eventType: dto.eventType,
      source: dto.source ?? 'marketing',
      campaignId: dto.campaignId ?? null,
      journeyId: dto.journeyId ?? null,
      properties: dto.properties ?? {},
    }));
  }

  private async sendCampaign(campaign: MarketingCampaignEntity): Promise<void> {
    const customers = await this.marketingSegments.matchCustomers(campaign.tenantId, campaign.segment.filters);
    for (const customer of customers) {
      await this.sendToCustomer(campaign, customer);
    }
    campaign.status = campaign.scheduleType === MarketingScheduleType.RECURRING
      ? MarketingCampaignStatus.ACTIVE
      : MarketingCampaignStatus.COMPLETED;
    campaign.scheduleAt = campaign.scheduleType === MarketingScheduleType.RECURRING
      ? this.nextRecurringSchedule(campaign.recurrenceRule)
      : null;
    await this.campaigns.save(campaign);
  }

  private async sendToCustomer(campaign: MarketingCampaignEntity, customer: CustomerEntity): Promise<void> {
    if (customer.gdprErasedAt || !(await this.withinFrequencyCap(campaign, customer.id))) {
      await this.log(campaign, customer.id, campaign.type, MarketingCampaignLogStatus.FAILED);
      return;
    }

    const channels = campaign.channels?.length ? campaign.channels : [campaign.type];
    for (const channel of channels) {
      const recipient = this.recipientForChannel(channel, customer);
      const optedIn = this.optedInForChannel(channel, customer);
      if (!recipient || !optedIn) {
        await this.log(campaign, customer.id, channel, MarketingCampaignLogStatus.FAILED);
        continue;
      }
      try {
        const notification = await this.notifications.createAndSend(campaign.tenantId, {
          type: NotificationType.CUSTOMER,
          channel: this.notificationChannel(channel),
          recipient,
          payload: {
            templateName: 'marketing',
            title: campaign.subject ?? campaign.name,
            subject: campaign.subject ?? campaign.name,
            message: this.interpolate(campaign.message, customer),
            category: 'marketing',
            campaignId: campaign.id,
            campaignCategory: campaign.campaignCategory,
          },
        });
        await this.log(campaign, customer.id, channel, notification.sentAt ? MarketingCampaignLogStatus.SENT : MarketingCampaignLogStatus.FAILED);
      } catch {
        await this.log(campaign, customer.id, channel, MarketingCampaignLogStatus.FAILED);
      }
    }
  }

  private async log(
    campaign: MarketingCampaignEntity,
    customerId: string,
    channel: MarketingCampaignType,
    status: MarketingCampaignLogStatus,
  ): Promise<void> {
    await this.logs.save(this.logs.create({
      campaignId: campaign.id,
      customerId,
      channel,
      status,
      sentAt: new Date(),
    }));
  }

  private async requireCampaign(tenantId: string, id: string): Promise<MarketingCampaignEntity> {
    const campaign = await this.campaigns.findOne({
      where: { tenantId, id },
      relations: { segment: true, logs: true },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  private async requireSegment(tenantId: string, id: string): Promise<MarketingSegmentEntity> {
    const segment = await this.segments.findOne({ where: { tenantId, id } });
    if (!segment) throw new NotFoundException('Segment not found');
    return segment;
  }

  private countTrackedLogs(tenantId: string, column: 'opened_at' | 'clicked_at' | 'converted_at' | 'unsubscribed_at') {
    return this.logs
      .createQueryBuilder('log')
      .innerJoin(MarketingCampaignEntity, 'campaign', 'campaign.id = log.campaign_id')
      .where('campaign.tenant_id = :tenantId', { tenantId })
      .andWhere(`log.${column} IS NOT NULL`)
      .getCount();
  }

  private async updateTrackingLog(
    campaignId: string,
    customerId: string,
    eventType: string,
    properties: Record<string, unknown>,
  ): Promise<void> {
    const log = await this.logs.findOne({ where: { campaignId, customerId }, order: { sentAt: 'DESC' } });
    if (!log) return;
    const now = new Date();
    if (eventType === 'view') log.openedAt = now;
    if (eventType === 'click') log.clickedAt = now;
    if (eventType === 'purchase') {
      log.convertedAt = now;
      const revenue = properties.revenue;
      if (typeof revenue === 'number' || typeof revenue === 'string') {
        log.revenueAttributed = Number(revenue).toFixed(2);
      }
    }
    if (eventType === 'unsubscribe') log.unsubscribedAt = now;
    log.metadata = { ...(log.metadata ?? {}), lastEventType: eventType, lastEventAt: now.toISOString(), properties };
    await this.logs.save(log);
  }

  private async applyUnsubscribe(
    tenantId: string,
    customerId: string,
    properties: Record<string, unknown>,
  ): Promise<void> {
    const customer = await this.marketingSegments.findCustomer(tenantId, customerId);
    if (!customer) return;
    const channel = properties.channel;
    if (!channel || channel === 'email') customer.marketingEmailOptIn = false;
    if (!channel || channel === 'sms') customer.marketingSmsOptIn = false;
    if (!channel || channel === 'push') customer.marketingPushOptIn = false;
    await this.marketingSegments.saveCustomer(customer);
  }

  private async withinFrequencyCap(campaign: MarketingCampaignEntity, customerId: string): Promise<boolean> {
    const days = Number((campaign.safetyRules ?? {}).frequencyCapDays ?? 7);
    const since = new Date(Date.now() - Math.max(1, days) * 86_400_000);
    const sent = await this.logs.count({
      where: {
        campaignId: campaign.id,
        customerId,
        status: MarketingCampaignLogStatus.SENT,
        sentAt: MoreThanOrEqual(since),
      },
    });
    return sent < Math.max(1, campaign.frequencyCap ?? 1);
  }

  private recipientForChannel(channel: MarketingCampaignType, customer: CustomerEntity): string | null {
    if (channel === MarketingCampaignType.EMAIL) return customer.email;
    if (channel === MarketingCampaignType.SMS) return customer.phone;
    return customer.email ?? customer.phone;
  }

  private optedInForChannel(channel: MarketingCampaignType, customer: CustomerEntity): boolean {
    if (channel === MarketingCampaignType.EMAIL) return customer.marketingEmailOptIn;
    if (channel === MarketingCampaignType.SMS) return customer.marketingSmsOptIn;
    return customer.marketingPushOptIn;
  }

  private notificationChannel(channel: MarketingCampaignType): NotificationChannelType {
    if (channel === MarketingCampaignType.EMAIL) return NotificationChannelType.EMAIL;
    if (channel === MarketingCampaignType.SMS) return NotificationChannelType.SMS;
    return NotificationChannelType.PUSH;
  }

  private nextRecurringSchedule(rule: string | null): Date {
    const amount = Number(rule?.match(/\d+/)?.[0] ?? 1);
    const multiplier = rule?.includes('hour') ? 3_600_000 : 86_400_000;
    return new Date(Date.now() + Math.max(1, amount) * multiplier);
  }

  private toResponse(campaign: MarketingCampaignEntity) {
    const logs = campaign.logs ?? [];
    const sentCount = logs.filter((log) => log.status === MarketingCampaignLogStatus.SENT).length;
    const unsubscribeCount = logs.filter((log) => log.unsubscribedAt).length;
    return {
      ...campaign,
      segmentName: campaign.segment?.name ?? null,
      sentCount,
      failedCount: logs.filter((log) => log.status === MarketingCampaignLogStatus.FAILED).length,
      openCount: logs.filter((log) => log.openedAt).length,
      clickCount: logs.filter((log) => log.clickedAt).length,
      conversionCount: logs.filter((log) => log.convertedAt).length,
      revenueAttribution: logs.reduce((sum, log) => sum + Number(log.revenueAttributed ?? 0), 0).toFixed(2),
      unsubscribeRate: sentCount ? Number(((unsubscribeCount / sentCount) * 100).toFixed(2)) : 0,
    };
  }

  private interpolate(message: string, customer: CustomerEntity): string {
    return message
      .replace(/\{\{name\}\}/g, customer.name)
      .replace(/\{\{points\}\}/g, String(customer.pointsBalance));
  }
}
