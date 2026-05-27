import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type DataLakeExportTarget = 'analytics' | 'ai_assistant' | 'marketing' | 'forecast' | 'power_bi' | 'looker' | 'tableau' | 'gdpr';

@Entity('data_lake_exports')
@Index(['tenantId', 'createdAt'])
export class DataLakeExportEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 32 })
  target!: DataLakeExportTarget;

  @Column({ name: 'entity_type', type: 'varchar', length: 64 })
  entityType!: string;

  @Column({ name: 'zone_key', type: 'varchar', length: 32 })
  zoneKey!: string;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: 'pending' | 'running' | 'succeeded' | 'failed';

  @Column({ name: 'row_count', type: 'bigint', default: 0 })
  rowCount!: string;

  @Column({ name: 'export_uri', type: 'varchar', length: 512, nullable: true })
  exportUri!: string | null;

  @Column({ name: 'pii_masked', type: 'boolean', default: true })
  piiMasked!: boolean;

  @Column({ name: 'requested_by', type: 'uuid', nullable: true })
  requestedBy!: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt!: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;
}
