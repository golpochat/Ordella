import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimestampsEntity } from './base-timestamps.entity';
import { OrderEntity } from './order.entity';

/** ERD §1.4 — order_items */
@Entity('order_items')
@Index(['orderId'])
export class OrderItemEntity extends BaseTimestampsEntity {
  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: OrderEntity;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'variant_id', type: 'uuid', nullable: true })
  variantId!: string | null;

  @Column({ name: 'bundle_id', type: 'uuid', nullable: true })
  bundleId!: string | null;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: string;

  @Column({ name: 'tax_category_id', type: 'uuid', nullable: true })
  taxCategoryId!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
