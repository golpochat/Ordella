import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CustomerEntity } from '../../loyalty/entities/customer.entity';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';

@Entity('customer_sessions')
@Index(['tenantId', 'customerId'])
export class CustomerSessionEntity extends BaseTenantScopedEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity;

  @Column({ name: 'device_label', type: 'varchar', length: 120, default: 'Customer app' })
  deviceLabel!: string;

  @Column({ name: 'last_seen_at', type: 'timestamptz' })
  lastSeenAt!: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;
}
