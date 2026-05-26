import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CustomerEntity } from '../../loyalty/entities/customer.entity';
import { MarketingCampaignEntity } from './marketing-campaign.entity';
import { MarketingCampaignLogStatus, MarketingCampaignType } from './marketing-campaign-status.enum';

@Entity('marketing_campaign_logs')
@Index(['campaignId', 'customerId'])
export class MarketingCampaignLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'campaign_id', type: 'uuid' })
  campaignId!: string;

  @ManyToOne(() => MarketingCampaignEntity, (campaign) => campaign.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign!: MarketingCampaignEntity;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity;

  @Column({ type: 'varchar', length: 16 })
  channel!: MarketingCampaignType;

  @Column({ type: 'varchar', length: 16 })
  status!: MarketingCampaignLogStatus;

  @Column({ name: 'sent_at', type: 'timestamptz', default: () => 'NOW()' })
  sentAt!: Date;

  @Column({ name: 'opened_at', type: 'timestamptz', nullable: true })
  openedAt!: Date | null;

  @Column({ name: 'clicked_at', type: 'timestamptz', nullable: true })
  clickedAt!: Date | null;

  @Column({ name: 'converted_at', type: 'timestamptz', nullable: true })
  convertedAt!: Date | null;

  @Column({ name: 'revenue_attributed', type: 'decimal', precision: 12, scale: 2, default: 0 })
  revenueAttributed!: string;

  @Column({ name: 'unsubscribed_at', type: 'timestamptz', nullable: true })
  unsubscribedAt!: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;
}
