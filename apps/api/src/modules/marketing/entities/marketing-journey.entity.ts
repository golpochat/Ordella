import { Column, Entity, Index } from 'typeorm';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';
import { MarketingCampaignStatus } from './marketing-campaign-status.enum';

@Entity('marketing_journeys')
@Index(['tenantId', 'status'])
export class MarketingJourneyEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 64 })
  trigger!: 'signup' | 'first_order' | 'churn_risk' | 'birthday' | 'tier_upgrade' | 'abandoned_cart' | 'low_stock';

  @Column({ name: 'target_segment_id', type: 'uuid', nullable: true })
  targetSegmentId!: string | null;

  @Column({ type: 'varchar', length: 32, default: MarketingCampaignStatus.DRAFT })
  status!: MarketingCampaignStatus;

  @Column({ name: 'channels', type: 'text', array: true, default: () => "'{}'" })
  channels!: string[];

  @Column({ name: 'frequency_cap', type: 'int', default: 1 })
  frequencyCap!: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  steps!: Array<Record<string, unknown>>;

  @Column({ name: 'safety_rules', type: 'jsonb', default: () => "'{}'" })
  safetyRules!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;
}
