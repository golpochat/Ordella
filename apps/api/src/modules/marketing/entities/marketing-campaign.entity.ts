import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';
import { MarketingCampaignLogEntity } from './marketing-campaign-log.entity';
import {
  MarketingCampaignAutomationType,
  MarketingCampaignStatus,
  MarketingCampaignType,
  MarketingScheduleType,
} from './marketing-campaign-status.enum';
import { MarketingSegmentEntity } from './marketing-segment.entity';

@Entity('marketing_campaigns')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'scheduleAt'])
export class MarketingCampaignEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 16 })
  type!: MarketingCampaignType;

  @Column({ name: 'campaign_type', type: 'varchar', length: 32, default: MarketingCampaignAutomationType.BROADCAST })
  campaignType!: MarketingCampaignAutomationType;

  @Column({ name: 'channels', type: 'text', array: true, default: () => "'{}'" })
  channels!: MarketingCampaignType[];

  @Column({ name: 'segment_id', type: 'uuid' })
  segmentId!: string;

  @ManyToOne(() => MarketingSegmentEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'segment_id' })
  segment!: MarketingSegmentEntity;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject!: string | null;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'schedule_at', type: 'timestamptz', nullable: true })
  scheduleAt!: Date | null;

  @Column({ name: 'schedule_type', type: 'varchar', length: 32, default: MarketingScheduleType.ONE_TIME })
  scheduleType!: MarketingScheduleType;

  @Column({ name: 'recurrence_rule', type: 'varchar', length: 120, nullable: true })
  recurrenceRule!: string | null;

  @Column({ name: 'frequency_cap', type: 'int', default: 1 })
  frequencyCap!: number;

  @Column({ name: 'campaign_category', type: 'varchar', length: 64, nullable: true })
  campaignCategory!: string | null;

  @Column({ name: 'safety_rules', type: 'jsonb', default: () => "'{}'" })
  safetyRules!: Record<string, unknown>;

  @Column({ name: 'metadata', type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 32, default: MarketingCampaignStatus.DRAFT })
  status!: MarketingCampaignStatus;

  @OneToMany(() => MarketingCampaignLogEntity, (log) => log.campaign)
  logs!: MarketingCampaignLogEntity[];
}
