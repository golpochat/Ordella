import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('offline_sync_conflicts')
@Index(['tenantId', 'locationId', 'status'])
@Index(['tenantId', 'operationId'])
export class OfflineSyncConflictEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'operation_id', type: 'uuid' })
  operationId!: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 64 })
  entityType!: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 160, nullable: true })
  entityId!: string | null;

  @Column({ name: 'conflict_type', type: 'varchar', length: 64 })
  conflictType!: 'revision_mismatch' | 'inventory_server_authoritative' | 'payment_review' | 'duplicate_mutation' | 'complex_merge_required' | 'offline_disabled' | 'device_unbound';

  @Column({ name: 'resolution_strategy', type: 'varchar', length: 32 })
  resolutionStrategy!: 'last_write_wins' | 'merge' | 'server_authoritative' | 'user_prompt';

  @Column({ type: 'varchar', length: 24, default: 'open' })
  status!: 'open' | 'resolved' | 'dismissed';

  @Column({ name: 'client_payload', type: 'jsonb', default: () => "'{}'" })
  clientPayload!: Record<string, unknown>;

  @Column({ name: 'server_payload', type: 'jsonb', default: () => "'{}'" })
  serverPayload!: Record<string, unknown>;

  @Column({ name: 'resolution_outcome', type: 'jsonb', default: () => "'{}'" })
  resolutionOutcome!: Record<string, unknown>;

  @Column({ name: 'resolved_by_user_id', type: 'uuid', nullable: true })
  resolvedByUserId!: string | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
