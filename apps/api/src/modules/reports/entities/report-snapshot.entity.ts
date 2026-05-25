import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('report_snapshots')
@Index(['tenantId', 'reportType', 'cacheKey'])
@Index(['tenantId', 'generatedAt'])
export class ReportSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'report_type', type: 'varchar', length: 64 })
  reportType!: string;

  @Column({ name: 'cache_key', type: 'varchar', length: 512 })
  cacheKey!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  payload!: Record<string, unknown>;

  @Column({ name: 'generated_at', type: 'timestamptz', default: () => 'NOW()' })
  generatedAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;
}
