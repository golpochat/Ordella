import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from '../../catalog/entities';
import { SupplierEntity } from './supplier.entity';

@Entity('supplier_items')
@Index(['supplierId', 'itemId'], { unique: true })
export class SupplierItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId!: string;

  @ManyToOne(() => SupplierEntity, (supplier) => supplier.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_id' })
  supplier!: SupplierEntity;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId!: string;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: ProductEntity;

  @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  costPrice!: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  sku!: string | null;

  @Column({ name: 'lead_time_days', type: 'int', default: 0 })
  leadTimeDays!: number;

  @Column({ name: 'min_order_qty', type: 'int', default: 1 })
  minOrderQty!: number;
}
