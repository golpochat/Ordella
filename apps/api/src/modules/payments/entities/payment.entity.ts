import { Column, Entity, Index, OneToMany } from 'typeorm';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { PaymentAttemptEntity } from './payment-attempt.entity';
import { RefundEntity } from './refund.entity';

/** ERD §1.5 — payments */
@Entity('payments')
@Index(['tenantId', 'orderId'])
@Index(['tenantId', 'status'])
export class PaymentEntity extends BaseTenantScopedEntity {
  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @Column({ type: 'varchar', length: 32 })
  provider!: PaymentProvider;

  @Column({ type: 'varchar', length: 32 })
  method!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 3, default: 'GBP' })
  currency!: string;

  @Column({ type: 'varchar', length: 32, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  /** Gateway / external reference (Payment.externalRef) */
  @Column({ name: 'provider_payment_id', type: 'varchar', length: 255, nullable: true })
  providerPaymentId!: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @Column({ name: 'payment_method_id', type: 'uuid', nullable: true })
  paymentMethodId!: string | null;

  @OneToMany(() => PaymentAttemptEntity, (attempt) => attempt.payment)
  attempts!: PaymentAttemptEntity[];

  @OneToMany(() => RefundEntity, (refund) => refund.payment)
  refunds!: RefundEntity[];
}
