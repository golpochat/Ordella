import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type InventorySyncReason = 'transfer' | 'adjustment' | 'auto-sync' | 'sale' | 'receiving';

@Entity('inventory_sync_logs')
@Index(['tenantId', 'itemId', 'createdAt'])
export class InventorySyncLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'item_id', type: 'uuid', nullable: true })
  itemId!: string | null;

  @Column({ name: 'from_location_id', type: 'uuid', nullable: true })
  fromLocationId!: string | null;

  @Column({ name: 'to_location_id', type: 'uuid', nullable: true })
  toLocationId!: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 4, default: 0 })
  quantity!: string;

  @Column({ type: 'varchar', length: 32 })
  reason!: InventorySyncReason;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
