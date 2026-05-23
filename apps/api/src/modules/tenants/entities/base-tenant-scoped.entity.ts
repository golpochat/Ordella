import { Column } from 'typeorm';
import { BaseTimestampsEntity } from './base-timestamps.entity';

/** Rows scoped to a tenant — SRS §2.4 tenant isolation */
export abstract class BaseTenantScopedEntity extends BaseTimestampsEntity {
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;
}
