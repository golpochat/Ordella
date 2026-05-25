import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CustomerEntity } from '../../loyalty/entities/customer.entity';
import { OrderEntity } from '../../orders/entities/order.entity';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { StoreCreditTransactionType } from './gift-card-transaction-type.enum';

@Entity('store_credit_transactions')
@Index(['tenantId', 'customerId', 'createdAt'])
export class StoreCreditTransactionEntity extends BaseTenantScopedEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 32 })
  type!: StoreCreditTransactionType;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId!: string | null;

  @ManyToOne(() => OrderEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order!: OrderEntity | null;
}
