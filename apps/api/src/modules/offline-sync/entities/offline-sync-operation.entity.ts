import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type OfflineSyncStatus = 'queued' | 'applied' | 'conflict' | 'failed' | 'superseded';
export type OfflineConflictStrategy = 'last_write_wins' | 'merge' | 'server_authoritative' | 'user_prompt';

@Entity('offline_sync_operations')
@Index(['tenantId', 'locationId', 'createdAt'])
@Index(['tenantId', 'clientMutationId'], { unique: true })
@Index(['tenantId', 'status', 'nextRetryAt'])
export class OfflineSyncOperationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'device_id', type: 'uuid', nullable: true })
  deviceId!: string | null;

  @Column({ name: 'client_mutation_id', type: 'varchar', length: 160 })
  clientMutationId!: string;

  @Column({ name: 'source_app', type: 'varchar', length: 32 })
  sourceApp!: 'pos' | 'warehouse' | 'delivery' | 'kiosk';

  @Column({ name: 'entity_type', type: 'varchar', length: 64 })
  entityType!: 'order' | 'cart' | 'payment' | 'receipt' | 'inventory_adjustment' | 'barcode_scan' | 'delivery_task' | 'promotion_snapshot' | 'warehouse_task';

  @Column({ name: 'entity_id', type: 'varchar', length: 160, nullable: true })
  entityId!: string | null;

  @Column({ name: 'operation_type', type: 'varchar', length: 32 })
  operationType!: 'create' | 'update' | 'delete' | 'complete' | 'print' | 'scan';

  @Column({ name: 'base_revision', type: 'int', nullable: true })
  baseRevision!: number | null;

  @Column({ name: 'server_revision', type: 'int', default: 1 })
  serverRevision!: number;

  @Column({ type: 'varchar', length: 24, default: 'queued' })
  status!: OfflineSyncStatus;

  @Column({ name: 'conflict_strategy', type: 'varchar', length: 32 })
  conflictStrategy!: OfflineConflictStrategy;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  payload!: Record<string, unknown>;

  @Column({ name: 'server_snapshot', type: 'jsonb', default: () => "'{}'" })
  serverSnapshot!: Record<string, unknown>;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ name: 'next_retry_at', type: 'timestamptz', nullable: true })
  nextRetryAt!: Date | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;

  @Column({ name: 'applied_at', type: 'timestamptz', nullable: true })
  appliedAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
