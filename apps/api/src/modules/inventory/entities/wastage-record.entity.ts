import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { StockItemEntity } from './stock-item.entity';

/** SRS §4.2 — wastage record */
@Entity('wastage_records')
@Index(['tenantId', 'locationId', 'createdAt'])
export class WastageRecordEntity extends BaseTenantScopedEntity {
  @Column({ name: 'stock_item_id', type: 'uuid' })
  stockItemId!: string;

  @ManyToOne(() => StockItemEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stock_item_id' })
  stockItem!: StockItemEntity;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  quantity!: string;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ name: 'recorded_by', type: 'uuid', nullable: true })
  recordedBy!: string | null;
}
