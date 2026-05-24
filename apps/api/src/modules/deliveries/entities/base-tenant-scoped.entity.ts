import { Column } from 'typeorm';
import { BaseTimestampsEntity } from './base-timestamps.entity';

export abstract class BaseTenantScopedEntity extends BaseTimestampsEntity {
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;
}
