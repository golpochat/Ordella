import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { StockReservationStatus } from '../enums/stock-reservation-status.enum';
import { StockReferenceType } from '../enums/stock-reference-type.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { StockItemEntity } from './stock-item.entity';

/** SRS §4.2 — stock reservation (checkout / order hold) */
@Entity('stock_reservations')
@Index(['stockItemId', 'status'])
export class StockReservationEntity extends BaseTenantScopedEntity {
  @Column({ name: 'stock_item_id', type: 'uuid' })
  stockItemId!: string;

  @ManyToOne(() => StockItemEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stock_item_id' })
  stockItem!: StockItemEntity;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  quantity!: string;

  @Column({ type: 'varchar', length: 32, default: StockReservationStatus.ACTIVE })
  status!: StockReservationStatus;

  @Column({ name: 'reference_type', type: 'varchar', length: 32 })
  referenceType!: StockReferenceType;

  @Column({ name: 'reference_id', type: 'uuid' })
  referenceId!: string;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;
}
