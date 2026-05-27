import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type WorkflowRunStatus = 'pending' | 'running' | 'waiting_approval' | 'succeeded' | 'failed' | 'cancelled';

@Entity('workflow_runs')
@Index(['tenantId', 'workflowId', 'startedAt'])
export class WorkflowRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'workflow_id', type: 'uuid' })
  workflowId!: string;

  @Column({ name: 'workflow_version_id', type: 'uuid' })
  workflowVersionId!: string;

  @Column({ type: 'int' })
  version!: number;

  @Column({ type: 'varchar', length: 32 })
  status!: WorkflowRunStatus;

  @Column({ name: 'trigger_type', type: 'varchar', length: 32 })
  triggerType!: string;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 160, nullable: true })
  idempotencyKey!: string | null;

  @Column({ name: 'sandbox_run', type: 'boolean', default: false })
  sandboxRun!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  context!: Record<string, unknown>;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt!: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt!: Date | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metrics!: Record<string, unknown>;
}
