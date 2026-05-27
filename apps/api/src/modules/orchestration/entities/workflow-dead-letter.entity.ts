import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('workflow_dead_letters')
@Index(['tenantId', 'status'])
export class WorkflowDeadLetterEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'workflow_run_id', type: 'uuid' })
  workflowRunId!: string;

  @Column({ name: 'workflow_step_run_id', type: 'uuid' })
  workflowStepRunId!: string;

  @Column({ type: 'varchar', length: 24, default: 'open' })
  status!: 'open' | 'resolved';

  @Column({ name: 'error_message', type: 'text' })
  errorMessage!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  payload!: Record<string, unknown>;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;
}
