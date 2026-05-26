import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from '../../catalog/entities';
import { PurchaseOrderEntity } from './purchase-order.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'purchase_order_id', type: 'uuid' })
  purchaseOrderId!: string;

  @ManyToOne(() => PurchaseOrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder!: PurchaseOrderEntity;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId!: string;

  @ManyToOne(() => ProductEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'item_id' })
  item!: ProductEntity;

  @Column({ name: 'quantity_ordered', type: 'int' })
  quantityOrdered!: number;

  @Column({ name: 'quantity_received', type: 'int', default: 0 })
  quantityReceived!: number;

  @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  costPrice!: string;

  @Column({ name: 'tax_category_id', type: 'uuid', nullable: true })
  taxCategoryId!: string | null;

  @Column({ name: 'tax_rule_id', type: 'uuid', nullable: true })
  taxRuleId!: string | null;

  @Column({ name: 'price_mode', type: 'varchar', length: 32, default: 'inclusive' })
  priceMode!: 'inclusive' | 'exclusive';

  @Column({ name: 'tax_rate', type: 'decimal', precision: 8, scale: 4, default: 0 })
  taxRate!: string;

  @Column({ name: 'taxable_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxableAmount!: string;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount!: string;
}
