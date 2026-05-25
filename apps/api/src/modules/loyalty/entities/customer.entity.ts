import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { LoyaltyTransactionEntity } from './loyalty-transaction.entity';

@Entity('customers')
@Index(['tenantId', 'email'])
@Index(['tenantId', 'phone'])
export class CustomerEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  passwordHash!: string | null;

  @Column({ name: 'points_balance', type: 'int', default: 0 })
  pointsBalance!: number;

  @Column({ name: 'store_credit_balance', type: 'decimal', precision: 12, scale: 2, default: 0 })
  storeCreditBalance!: string;

  @Column({ name: 'default_address_id', type: 'uuid', nullable: true })
  defaultAddressId!: string | null;

  @Column({ name: 'lifetime_value', type: 'decimal', precision: 12, scale: 2, default: 0 })
  lifetimeValue!: string;

  @Column({ name: 'last_order_at', type: 'timestamptz', nullable: true })
  lastOrderAt!: Date | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  @OneToMany(() => LoyaltyTransactionEntity, (transaction) => transaction.customer)
  loyaltyTransactions!: LoyaltyTransactionEntity[];
}
