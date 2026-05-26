import { Column, Entity, Index } from 'typeorm';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';

@Entity('marketing_behavior_events')
@Index(['tenantId', 'customerId', 'eventType'])
@Index(['tenantId', 'eventType', 'occurredAt'])
export class MarketingBehaviorEventEntity extends BaseTenantScopedEntity {
  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId!: string | null;

  @Column({ name: 'event_type', type: 'varchar', length: 64 })
  eventType!: 'view' | 'click' | 'purchase' | 'signup' | 'abandoned_cart' | 'low_stock_alert' | 'unsubscribe';

  @Column({ type: 'varchar', length: 64, default: 'marketing' })
  source!: string;

  @Column({ name: 'campaign_id', type: 'uuid', nullable: true })
  campaignId!: string | null;

  @Column({ name: 'journey_id', type: 'uuid', nullable: true })
  journeyId!: string | null;

  @Column({ name: 'occurred_at', type: 'timestamptz', default: () => 'NOW()' })
  occurredAt!: Date;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  properties!: Record<string, unknown>;
}
