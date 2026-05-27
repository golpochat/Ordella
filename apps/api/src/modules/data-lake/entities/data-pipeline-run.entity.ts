import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type DataPipelineRunStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled';

@Entity('data_pipeline_runs')
@Index(['tenantId', 'pipelineId', 'startedAt'])
export class DataPipelineRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'pipeline_id', type: 'uuid' })
  pipelineId!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: DataPipelineRunStatus;

  @Column({ name: 'run_mode', type: 'varchar', length: 32, default: 'incremental' })
  runMode!: 'incremental' | 'backfill' | 'full';

  @Column({ name: 'partition_date', type: 'date', nullable: true })
  partitionDate!: string | null;

  @Column({ name: 'records_in', type: 'bigint', default: 0 })
  recordsIn!: string;

  @Column({ name: 'records_out', type: 'bigint', default: 0 })
  recordsOut!: string;

  @Column({ name: 'records_deduped', type: 'bigint', default: 0 })
  recordsDeduped!: string;

  @Column({ name: 'records_rejected', type: 'bigint', default: 0 })
  recordsRejected!: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  errors!: Array<Record<string, unknown>>;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt!: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt!: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metrics!: Record<string, unknown>;
}
