import { Column, Entity, Index, OneToMany } from 'typeorm';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderType } from '../enums/order-type.enum';
import { OrderPaymentStatus } from '../enums/order-payment-status.enum';
import { OrderPaymentMethod } from '../enums/order-payment-method.enum';
import { OrderDeliveryDetails } from '../types/order-delivery-details.types';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { OrderItemEntity } from './order-item.entity';
import { OrderStatusHistoryEntity } from './order-status-history.entity';
import { OrderEventEntity } from './order-event.entity';
import { OrderTaxLineEntity } from '../../tax/entities/order-tax-line.entity';

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

  @Column({
    name: 'payment_status',
    type: 'varchar',
    length: 32,
    default: OrderPaymentStatus.UNPAID,
  })
  paymentStatus!: OrderPaymentStatus;

  @Column({ name: 'payment_method', type: 'varchar', length: 32, nullable: true })
  paymentMethod!: OrderPaymentMethod | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total!: string;

  @Column({ name: 'discount_total', type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountTotal!: string;

  @Column({ name: 'promotion_ids', type: 'uuid', array: true, default: () => "'{}'" })
  promotionIds!: string[];

  @Column({ name: 'applied_promotions', type: 'jsonb', default: () => "'[]'" })
  appliedPromotions!: Array<{ promotionId: string; code?: string | null; discountAmount: string }>;

  @Column({ name: 'order_number', type: 'varchar', length: 32, nullable: true })
  orderNumber!: string | null;

  @Column({ name: 'delivery_details', type: 'jsonb', nullable: true })
  deliveryDetails!: OrderDeliveryDetails | null;

  @OneToMany(() => OrderItemEntity, (item) => item.order)
  items!: OrderItemEntity[];

  @OneToMany(() => OrderStatusHistoryEntity, (history) => history.order)
  statusHistory!: OrderStatusHistoryEntity[];

  @OneToMany(() => OrderEventEntity, (event) => event.order)
  events!: OrderEventEntity[];

  @OneToMany(() => OrderTaxLineEntity, (taxLine) => taxLine.order)
  taxLines!: OrderTaxLineEntity[];
}
