import { Column, Entity, Index, OneToMany } from 'typeorm';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderType } from '../enums/order-type.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { OrderItemEntity } from './order-item.entity';
import { OrderStatusHistoryEntity } from './order-status-history.entity';
import { OrderEventEntity } from './order-event.entity';

/** ERD §1.4 — orders */
@Entity('orders')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'locationId', 'createdAt'])
export class OrderEntity extends BaseTenantScopedEntity {
  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId!: string | null;

  @Column({ name: 'order_type', type: 'varchar', length: 32 })
  orderType!: OrderType;

  @Column({ type: 'varchar', length: 32, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total!: string;

  @Column({ name: 'order_number', type: 'varchar', length: 32, nullable: true })
  orderNumber!: string | null;

  @OneToMany(() => OrderItemEntity, (item) => item.order)
  items!: OrderItemEntity[];

  @OneToMany(() => OrderStatusHistoryEntity, (history) => history.order)
  statusHistory!: OrderStatusHistoryEntity[];

  @OneToMany(() => OrderEventEntity, (event) => event.order)
  events!: OrderEventEntity[];
}
