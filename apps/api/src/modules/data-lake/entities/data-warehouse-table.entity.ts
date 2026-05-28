import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type WarehouseTableKind = 'dimension' | 'fact';

@Entity('data_warehouse_tables')
@Index(['tenantId', 'tableKey'], { unique: true })
export class DataWarehouseTableEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'table_key', type: 'varchar', length: 64 })
  tableKey!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 180 })
  displayName!: string;

  @Column({ name: 'table_kind', type: 'varchar', length: 32 })
  tableKind!: WarehouseTableKind;

  @Column({ name: 'grain', type: 'varchar', length: 128, nullable: true })
  grain!: string | null;

  @Column({ name: 'row_count', type: 'bigint', default: 0 })
  rowCount!: string;

  @Column({ name: 'last_refreshed_at', type: 'timestamptz', nullable: true })
  lastRefreshedAt!: Date | null;

  @Column({ name: 'is_materialized', type: 'boolean', default: false })
  isMaterialized!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  columns!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
