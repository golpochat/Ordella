import { Column, Entity, Index } from 'typeorm';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';

@Entity('marketing_segments')
@Index(['tenantId', 'name'])
export class MarketingSegmentEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'jsonb', default: {} })
  filters!: Record<string, unknown>;

  @Column({ name: 'builder_type', type: 'varchar', length: 32, default: 'custom' })
  builderType!: 'rfm' | 'ltv' | 'churn' | 'behavior' | 'custom';

  @Column({ name: 'rule_summary', type: 'jsonb', default: () => "'[]'" })
  ruleSummary!: Array<Record<string, unknown>>;
}
