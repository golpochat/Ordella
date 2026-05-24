import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { RefundStatus } from '../enums/refund-status.enum';
import { BaseTimestampsEntity } from './base-timestamps.entity';
import { PaymentEntity } from './payment.entity';

/** ERD §1.5 — refunds */
@Entity('refunds')
@Index(['paymentId'])
export class RefundEntity extends BaseTimestampsEntity {
  @Column({ name: 'payment_id', type: 'uuid' })
  paymentId!: string;

  @ManyToOne(() => PaymentEntity, (payment) => payment.refunds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment!: PaymentEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ type: 'varchar', length: 32, default: RefundStatus.PENDING })
  status!: RefundStatus;

  @Column({ name: 'provider_refund_id', type: 'varchar', length: 255, nullable: true })
  providerRefundId!: string | null;
}
