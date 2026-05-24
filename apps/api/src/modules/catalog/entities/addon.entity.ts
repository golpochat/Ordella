import { Column, Entity, Index } from 'typeorm';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';

/** ERD §1.2 — addons */
@Entity('addons')
@Index(['tenantId', 'name'])
export class AddonEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price!: string;
}
