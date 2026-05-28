import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type DataLakeZoneKey = 'raw' | 'processed' | 'analytics' | 'ml';

@Entity('data_lake_zones')
@Index(['tenantId', 'zoneKey'], { unique: true })
export class DataLakeZoneEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'zone_key', type: 'varchar', length: 32 })
  zoneKey!: DataLakeZoneKey;

  @Column({ name: 'display_name', type: 'varchar', length: 180 })
  displayName!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'retention_days', type: 'int', default: 90 })
  retentionDays!: number;

  @Column({ name: 'immutable', type: 'boolean', default: false })
  immutable!: boolean;

  @Column({ name: 'object_count', type: 'bigint', default: 0 })
  objectCount!: string;

  @Column({ name: 'bytes_estimate', type: 'bigint', default: 0 })
  bytesEstimate!: string;

  @Column({ name: 'last_ingested_at', type: 'timestamptz', nullable: true })
  lastIngestedAt!: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
