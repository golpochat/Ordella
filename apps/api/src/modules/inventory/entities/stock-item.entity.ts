import { Column, Entity, Index } from 'typeorm';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';

/** ERD §1.3 — stock_items (SRS §4.4 multi-location via location_id) */
@Entity('stock_items')
@Index(['tenantId', 'locationId', 'sku'], { unique: true })
export class StockItemEntity extends BaseTenantScopedEntity {
  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 128 })
  sku!: string;

  @Column({ type: 'varchar', length: 32 })
  unit!: string;

  /** Current on-hand quantity snapshot — updated atomically via movements (SRS §4.4) */
  @Column({ name: 'quantity_on_hand', type: 'decimal', precision: 14, scale: 4, default: 0 })
  quantityOnHand!: string;

  /** Soft-held quantity for pending orders (InventoryItem.quantityReserved) */
  @Column({ name: 'quantity_reserved', type: 'decimal', precision: 14, scale: 4, default: 0 })
  quantityReserved!: string;

  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  productId!: string | null;

  @Column({ name: 'reorder_level', type: 'decimal', precision: 14, scale: 4, nullable: true })
  reorderLevel!: string | null;

  @Column({ name: 'sync_source', type: 'varchar', length: 32, default: 'store' })
  syncSource!: 'store' | 'warehouse' | 'external';

  @Column({ name: 'last_synced_at', type: 'timestamptz', nullable: true })
  lastSyncedAt!: Date | null;

  @Column({ name: 'safety_stock_level', type: 'decimal', precision: 14, scale: 4, nullable: true })
  safetyStockLevel!: string | null;

  @Column({ name: 'reorder_point', type: 'decimal', precision: 14, scale: 4, nullable: true })
  reorderPoint!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'last_received_at', type: 'timestamptz', nullable: true })
  lastReceivedAt!: Date | null;
}
