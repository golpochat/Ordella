import { Column, Entity, Index } from 'typeorm';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';

@Entity('marketing_segments')
@Index(['tenantId', 'name'])
export class MarketingSegmentEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'jsonb', default: {} })
  filters!: Record<string, unknown>;
}
