import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('data_materialized_views')
@Index(['tenantId', 'viewKey'], { unique: true })
export class DataMaterializedViewEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'view_key', type: 'varchar', length: 64 })
  viewKey!: string;

  @Column({ type: 'varchar', length: 180 })
  displayName!: string;

  @Column({ name: 'kpi_category', type: 'varchar', length: 64 })
  kpiCategory!: string;

  @Column({ type: 'text' })
  definitionSql!: string;

  @Column({ name: 'refresh_cron', type: 'varchar', length: 64, nullable: true })
  refreshCron!: string | null;

  @Column({ name: 'last_refreshed_at', type: 'timestamptz', nullable: true })
  lastRefreshedAt!: Date | null;

  @Column({ name: 'row_count', type: 'bigint', default: 0 })
  rowCount!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
