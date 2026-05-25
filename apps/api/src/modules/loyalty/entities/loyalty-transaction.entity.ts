import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { OrderEntity } from '../../orders/entities/order.entity';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { CustomerEntity } from './customer.entity';
import { LoyaltyTransactionType } from './loyalty-transaction-type.enum';

@Entity('loyalty_transactions')
@Index(['tenantId', 'customerId', 'createdAt'])
@Index(['tenantId', 'type'])
export class LoyaltyTransactionEntity extends BaseTenantScopedEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => CustomerEntity, (customer) => customer.loyaltyTransactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity;

  @Column({ type: 'int' })
  points!: number;

  @Column({ type: 'varchar', length: 32 })
  type!: LoyaltyTransactionType;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId!: string | null;

  @ManyToOne(() => OrderEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'order_id' })
  order!: OrderEntity | null;
}
