import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { StockItemEntity } from './stock-item.entity';

/** SRS §4.2 — stock adjustment (manual corrections) */
@Entity('stock_adjustments')
@Index(['stockItemId', 'createdAt'])
export class StockAdjustmentEntity extends BaseTenantScopedEntity {
  @Column({ name: 'stock_item_id', type: 'uuid' })
  stockItemId!: string;

  @ManyToOne(() => StockItemEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stock_item_id' })
  stockItem!: StockItemEntity;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'quantity_delta', type: 'decimal', precision: 14, scale: 4 })
  quantityDelta!: string;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ name: 'adjusted_by', type: 'uuid', nullable: true })
  adjustedBy!: string | null;
}
