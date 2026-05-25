import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CustomerEntity } from '../../loyalty/entities/customer.entity';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { GiftCardTransactionEntity } from './gift-card-transaction.entity';

@Entity('gift_cards')
@Index(['tenantId', 'code'], { unique: true })
@Index(['tenantId', 'customerId'])
export class GiftCardEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ name: 'initial_value', type: 'decimal', precision: 12, scale: 2 })
  initialValue!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  balance!: string;

  @Column({ type: 'varchar', length: 3, default: 'EUR' })
  currency!: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId!: string | null;

  @ManyToOne(() => CustomerEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => GiftCardTransactionEntity, (transaction) => transaction.giftCard)
  transactions!: GiftCardTransactionEntity[];
}
