import { Column, Entity, Index } from 'typeorm';
import { BaseTenantScopedEntity } from '../../orders/entities/base-tenant-scoped.entity';

export type PosOfflineOrderSyncStatus = 'pending' | 'synced' | 'requires_review' | 'failed';

@Entity('pos_offline_order_syncs')
@Index(['tenantId', 'clientOrderId'], { unique: true })
@Index(['tenantId', 'locationId', 'status'])
export class PosOfflineOrderSyncEntity extends BaseTenantScopedEntity {
  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'client_order_id', type: 'uuid' })
  clientOrderId!: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: PosOfflineOrderSyncStatus;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  conflicts!: string[];

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ name: 'synced_at', type: 'timestamptz', nullable: true })
  syncedAt!: Date | null;
}
