import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { StockMovementType } from '../enums/stock-movement-type.enum';
import { StockReferenceType } from '../enums/stock-reference-type.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { StockItemEntity } from './stock-item.entity';

/** ERD §1.3 — stock_movements */
@Entity('stock_movements')
@Index(['stockItemId', 'createdAt'])
export class StockMovementEntity extends BaseTenantScopedEntity {
  @Column({ name: 'stock_item_id', type: 'uuid' })
  stockItemId!: string;

  @ManyToOne(() => StockItemEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stock_item_id' })
  stockItem!: StockItemEntity;

  @Column({ type: 'varchar', length: 32 })
  type!: StockMovementType;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  quantity!: string;

  @Column({ name: 'reference_type', type: 'varchar', length: 32, nullable: true })
  referenceType!: StockReferenceType | null;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
