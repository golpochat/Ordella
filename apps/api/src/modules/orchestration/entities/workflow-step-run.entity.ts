import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type WorkflowStepRunStatus = 'pending' | 'running' | 'waiting_approval' | 'succeeded' | 'failed' | 'skipped' | 'dead_letter';

@Entity('workflow_step_runs')
@Index(['tenantId', 'workflowRunId', 'stepKey'])
export class WorkflowStepRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'workflow_run_id', type: 'uuid' })
  workflowRunId!: string;

  @Column({ name: 'workflow_step_id', type: 'uuid' })
  workflowStepId!: string;

  @Column({ name: 'step_key', type: 'varchar', length: 64 })
  stepKey!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: WorkflowStepRunStatus;

  @Column({ name: 'attempt_count', type: 'int', default: 0 })
  attemptCount!: number;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  input!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  output!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  logs!: Array<{ at: string; level: string; message: string }>;

  @Column({ name: 'error_trace', type: 'text', nullable: true })
  errorTrace!: string | null;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 160, nullable: true })
  idempotencyKey!: string | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt!: Date | null;
}
