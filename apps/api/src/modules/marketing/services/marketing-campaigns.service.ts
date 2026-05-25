import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { CustomerEntity } from '../../loyalty/entities';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { CreateMarketingCampaignDto, UpdateMarketingCampaignDto } from '../dto';
import {
  MarketingCampaignEntity,
  MarketingCampaignLogEntity,
  MarketingCampaignLogStatus,
  MarketingCampaignStatus,
  MarketingCampaignType,
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
      segmentId: dto.segmentId,
      subject: dto.type === MarketingCampaignType.EMAIL ? dto.subject?.trim() ?? null : null,
      message: dto.message,
      scheduleAt,
      status: scheduleAt ? MarketingCampaignStatus.SCHEDULED : MarketingCampaignStatus.DRAFT,
    }));
    return this.toResponse(await this.requireCampaign(tenant.tenantId, campaign.id));
  }

  async update(tenant: TenantContext, id: string, dto: UpdateMarketingCampaignDto) {
    const campaign = await this.requireCampaign(tenant.tenantId, id);
    await this.requireSegment(tenant.tenantId, dto.segmentId);
    campaign.name = dto.name.trim();
    campaign.type = dto.type;
    campaign.segmentId = dto.segmentId;
    campaign.subject = dto.type === MarketingCampaignType.EMAIL ? dto.subject?.trim() ?? null : null;
    campaign.message = dto.message;
    campaign.scheduleAt = dto.scheduleAt ? new Date(dto.scheduleAt) : null;
    if (campaign.status !== MarketingCampaignStatus.SENT) {
      campaign.status = campaign.scheduleAt ? MarketingCampaignStatus.SCHEDULED : MarketingCampaignStatus.DRAFT;
    }
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
      segmentId: campaign.segmentId,
      subject: campaign.subject,
      message: campaign.message,
      scheduleAt: null,
      status: MarketingCampaignStatus.DRAFT,
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
    const [campaigns, sent, failed] = await Promise.all([
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
    ]);
    return { campaigns, sent, failed, delivered: sent, clicks: 0, conversions: 0 };
  }

  private async sendCampaign(campaign: MarketingCampaignEntity): Promise<void> {
    const customers = await this.marketingSegments.matchCustomers(campaign.tenantId, campaign.segment.filters);
    for (const customer of customers) {
      await this.sendToCustomer(campaign, customer);
    }
    campaign.status = MarketingCampaignStatus.SENT;
    campaign.scheduleAt = null;
    await this.campaigns.save(campaign);
  }

  private async sendToCustomer(campaign: MarketingCampaignEntity, customer: CustomerEntity): Promise<void> {
    const recipient = campaign.type === MarketingCampaignType.EMAIL ? customer.email : customer.phone;
    const optedIn = campaign.type === MarketingCampaignType.EMAIL
      ? customer.marketingEmailOptIn
      : customer.marketingSmsOptIn;
    if (!recipient || !optedIn) {
      await this.log(campaign, customer.id, MarketingCampaignLogStatus.FAILED);
      return;
    }
    try {
      const notification = await this.notifications.createAndSend(campaign.tenantId, {
        type: NotificationType.CUSTOMER,
        channel: campaign.type === MarketingCampaignType.EMAIL ? NotificationChannelType.EMAIL : NotificationChannelType.SMS,
        recipient,
        payload: {
          templateName: 'marketing',
          title: campaign.subject ?? campaign.name,
          subject: campaign.subject ?? campaign.name,
          message: this.interpolate(campaign.message, customer),
          category: 'marketing',
          campaignId: campaign.id,
        },
      });
      await this.log(campaign, customer.id, notification.sentAt ? MarketingCampaignLogStatus.SENT : MarketingCampaignLogStatus.FAILED);
    } catch {
      await this.log(campaign, customer.id, MarketingCampaignLogStatus.FAILED);
    }
  }

  private async log(campaign: MarketingCampaignEntity, customerId: string, status: MarketingCampaignLogStatus): Promise<void> {
    await this.logs.save(this.logs.create({
      campaignId: campaign.id,
      customerId,
      channel: campaign.type,
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

  private toResponse(campaign: MarketingCampaignEntity) {
    const logs = campaign.logs ?? [];
    return {
      ...campaign,
      segmentName: campaign.segment?.name ?? null,
      sentCount: logs.filter((log) => log.status === MarketingCampaignLogStatus.SENT).length,
      failedCount: logs.filter((log) => log.status === MarketingCampaignLogStatus.FAILED).length,
    };
  }

  private interpolate(message: string, customer: CustomerEntity): string {
    return message
      .replace(/\{\{name\}\}/g, customer.name)
      .replace(/\{\{points\}\}/g, String(customer.pointsBalance));
  }
}
