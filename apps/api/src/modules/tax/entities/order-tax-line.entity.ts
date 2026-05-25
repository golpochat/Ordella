import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderEntity } from '../../orders/entities/order.entity';
import { OrderItemEntity } from '../../orders/entities/order-item.entity';
import { TaxPriceMode, TaxRuleEntity, TaxType } from './tax-rule.entity';
import { TaxCategoryEntity } from './tax-category.entity';

@Entity('order_tax_lines')
@Index(['tenantId', 'orderId'])
@Index(['tenantId', 'locationId', 'createdAt'])
export class OrderTaxLineEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @ManyToOne(() => OrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: OrderEntity;

  @Column({ name: 'order_item_id', type: 'uuid', nullable: true })
  orderItemId!: string | null;

  @ManyToOne(() => OrderItemEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem!: OrderItemEntity | null;

  @Column({ name: 'tax_rule_id', type: 'uuid', nullable: true })
  taxRuleId!: string | null;

  @ManyToOne(() => TaxRuleEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tax_rule_id' })
  taxRule!: TaxRuleEntity | null;

  @Column({ name: 'tax_category_id', type: 'uuid', nullable: true })
  taxCategoryId!: string | null;

  @ManyToOne(() => TaxCategoryEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tax_category_id' })
  taxCategory!: TaxCategoryEntity | null;

  @Column({ name: 'tax_name', type: 'varchar', length: 128 })
  taxName!: string;

  @Column({ name: 'tax_type', type: 'varchar', length: 32 })
  taxType!: TaxType;

  @Column({ name: 'price_mode', type: 'varchar', length: 32 })
  priceMode!: TaxPriceMode;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 8, scale: 4 })
  taxRate!: string;

  @Column({ name: 'taxable_amount', type: 'decimal', precision: 12, scale: 2 })
  taxableAmount!: string;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2 })
  taxAmount!: string;

  @Column({ name: 'jurisdiction', type: 'varchar', length: 128 })
  jurisdiction!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
