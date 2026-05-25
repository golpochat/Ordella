import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type ReplenishmentActionType = 'create_po' | 'create_transfer' | 'alert';
export type ReplenishmentActionStatus = 'pending' | 'completed' | 'failed';

@Entity('replenishment_actions')
@Index(['tenantId', 'status', 'createdAt'])
@Index(['tenantId', 'locationId', 'itemId', 'status'])
export class ReplenishmentActionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'rule_id', type: 'uuid', nullable: true })
  ruleId!: string | null;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId!: string;

  @Column({ name: 'stock_item_id', type: 'uuid', nullable: true })
  stockItemId!: string | null;

  @Column({ name: 'action_type', type: 'varchar', length: 32 })
  actionType!: ReplenishmentActionType;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  quantity!: string;

  @Column({ name: 'source_location_id', type: 'uuid', nullable: true })
  sourceLocationId!: string | null;

  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: ReplenishmentActionStatus;

  @Column({ name: 'purchase_order_id', type: 'uuid', nullable: true })
  purchaseOrderId!: string | null;

  @Column({ name: 'stock_transfer_id', type: 'uuid', nullable: true })
  stockTransferId!: string | null;

  @Column({ name: 'pick_task_id', type: 'uuid', nullable: true })
  pickTaskId!: string | null;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  error!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
