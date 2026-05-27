import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('data_lake_partitions')
@Index(['tenantId', 'zoneKey', 'partitionDate', 'entityType'], { unique: true })
export class DataLakePartitionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'zone_key', type: 'varchar', length: 32 })
  zoneKey!: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 64 })
  entityType!: string;

  @Column({ name: 'partition_date', type: 'date' })
  partitionDate!: string;

  @Column({ name: 'record_count', type: 'bigint', default: 0 })
  recordCount!: string;

  @Column({ name: 'bytes_estimate', type: 'bigint', default: 0 })
  bytesEstimate!: string;

  @Column({ name: 'compression', type: 'varchar', length: 32, default: 'snappy' })
  compression!: string;

  @Column({ name: 'storage_uri', type: 'varchar', length: 512, nullable: true })
  storageUri!: string | null;

  @Column({ name: 'last_refreshed_at', type: 'timestamptz', nullable: true })
  lastRefreshedAt!: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;
}
