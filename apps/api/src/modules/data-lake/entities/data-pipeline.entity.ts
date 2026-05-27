import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type DataPipelineType = 'batch' | 'streaming' | 'etl' | 'elt';
export type DataPipelineStatus = 'idle' | 'running' | 'failed' | 'paused';

@Entity('data_pipelines')
@Index(['tenantId', 'pipelineKey'], { unique: true })
export class DataPipelineEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'pipeline_key', type: 'varchar', length: 64 })
  pipelineKey!: string;

  @Column({ type: 'varchar', length: 180 })
  displayName!: string;

  @Column({ name: 'pipeline_type', type: 'varchar', length: 32 })
  pipelineType!: DataPipelineType;

  @Column({ name: 'source_zone', type: 'varchar', length: 32, nullable: true })
  sourceZone!: string | null;

  @Column({ name: 'target_zone', type: 'varchar', length: 32, nullable: true })
  targetZone!: string | null;

  @Column({ name: 'schedule_cron', type: 'varchar', length: 64, nullable: true })
  scheduleCron!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'idle' })
  status!: DataPipelineStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'last_run_at', type: 'timestamptz', nullable: true })
  lastRunAt!: Date | null;

  @Column({ name: 'last_success_at', type: 'timestamptz', nullable: true })
  lastSuccessAt!: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  config!: Record<string, unknown>;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
