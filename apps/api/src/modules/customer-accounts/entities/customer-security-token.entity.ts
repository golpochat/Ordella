import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CustomerEntity } from '../../loyalty/entities/customer.entity';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';

export type CustomerSecurityTokenType = 'email_verification' | 'password_reset';

@Entity('customer_security_tokens')
@Index(['tenantId', 'customerId', 'type'])
@Index(['tenantId', 'tokenHash'], { unique: true })
export class CustomerSecurityTokenEntity extends BaseTenantScopedEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity;

  @Column({ type: 'varchar', length: 32 })
  type!: CustomerSecurityTokenType;

  @Column({ name: 'token_hash', type: 'varchar', length: 128 })
  tokenHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'consumed_at', type: 'timestamptz', nullable: true })
  consumedAt!: Date | null;
}
