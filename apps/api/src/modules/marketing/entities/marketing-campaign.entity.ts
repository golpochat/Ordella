import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';
import { MarketingCampaignLogEntity } from './marketing-campaign-log.entity';
import { MarketingCampaignStatus, MarketingCampaignType } from './marketing-campaign-status.enum';
import { MarketingSegmentEntity } from './marketing-segment.entity';

@Entity('marketing_campaigns')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'scheduleAt'])
export class MarketingCampaignEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 16 })
  type!: MarketingCampaignType;

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

  @Column({ type: 'varchar', length: 32, default: MarketingCampaignStatus.DRAFT })
  status!: MarketingCampaignStatus;

  @OneToMany(() => MarketingCampaignLogEntity, (log) => log.campaign)
  logs!: MarketingCampaignLogEntity[];
}
