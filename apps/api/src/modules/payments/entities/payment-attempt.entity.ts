import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentAttemptStatus } from '../enums/payment-attempt-status.enum';
import { PaymentEntity } from './payment.entity';

/** SRS §9 — gateway attempt log per payment */
@Entity('payment_attempts')
@Index(['paymentId', 'createdAt'])
export class PaymentAttemptEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'payment_id', type: 'uuid' })
  paymentId!: string;

  @ManyToOne(() => PaymentEntity, (payment) => payment.attempts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment!: PaymentEntity;

  @Column({ name: 'attempt_number', type: 'int', default: 1 })
  attemptNumber!: number;

  @Column({ type: 'varchar', length: 32, default: PaymentAttemptStatus.PENDING })
  status!: PaymentAttemptStatus;

  @Column({ name: 'provider_response', type: 'jsonb', default: {} })
  providerResponse!: Record<string, unknown>;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
