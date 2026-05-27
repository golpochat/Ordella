import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('data_lake_settings')
@Index(['tenantId'], { unique: true })
export class DataLakeSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'storage_format', type: 'varchar', length: 32, default: 'parquet' })
  storageFormat!: 'parquet' | 'json' | 'csv';

  @Column({ name: 'compression', type: 'varchar', length: 32, default: 'snappy' })
  compression!: 'none' | 'snappy' | 'gzip' | 'zstd';

  @Column({ name: 'columnar_enabled', type: 'boolean', default: true })
  columnarEnabled!: boolean;

  @Column({ name: 'partition_granularity', type: 'varchar', length: 16, default: 'daily' })
  partitionGranularity!: 'hourly' | 'daily';

  @Column({ name: 'pii_masking_enabled', type: 'boolean', default: true })
  piiMaskingEnabled!: boolean;

  @Column({ name: 'default_retention_days', type: 'int', default: 365 })
  defaultRetentionDays!: number;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
