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

  @Column({ name: 'total_orders', type: 'int', default: 0 })
  totalOrders!: number;

  @Column({ name: 'avg_order_value', type: 'decimal', precision: 12, scale: 2, default: 0 })
  avgOrderValue!: string;

  @Column({ name: 'first_order_at', type: 'timestamptz', nullable: true })
  firstOrderAt!: Date | null;

  @Column({ name: 'last_order_at', type: 'timestamptz', nullable: true })
  lastOrderAt!: Date | null;

  @Column({ name: 'preferred_location_id', type: 'uuid', nullable: true })
  preferredLocationId!: string | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  tags!: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  segments!: string[];

  @Column({ name: 'staff_notes', type: 'text', nullable: true })
  staffNotes!: string | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true })
  emailVerifiedAt!: Date | null;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  gender!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  preferences!: Record<string, unknown>;

  @Column({ name: 'notification_email_opt_in', type: 'boolean', default: true })
  notificationEmailOptIn!: boolean;

  @Column({ name: 'notification_sms_opt_in', type: 'boolean', default: false })
  notificationSmsOptIn!: boolean;

  @Column({ name: 'notification_push_opt_in', type: 'boolean', default: true })
  notificationPushOptIn!: boolean;

  @Column({ name: 'marketing_email_opt_in', type: 'boolean', default: true })
  marketingEmailOptIn!: boolean;

  @Column({ name: 'marketing_sms_opt_in', type: 'boolean', default: false })
  marketingSmsOptIn!: boolean;

  @Column({ name: 'marketing_push_opt_in', type: 'boolean', default: false })
  marketingPushOptIn!: boolean;

  @Column({ name: 'gdpr_erased_at', type: 'timestamptz', nullable: true })
  gdprErasedAt!: Date | null;

  @OneToMany(() => LoyaltyTransactionEntity, (transaction) => transaction.customer)
  loyaltyTransactions!: LoyaltyTransactionEntity[];
}
