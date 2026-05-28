import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type WorkflowStepType =
  | 'data_fetch'
  | 'condition'
  | 'delay'
  | 'approval'
  | 'notification'
  | 'entity_mutation'
  | 'integration'
  | 'ai_action'
  | 'custom_code';

@Entity('workflow_steps')
@Index(['tenantId', 'workflowVersionId', 'stepKey'], { unique: true })
export class WorkflowStepEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'workflow_id', type: 'uuid' })
  workflowId!: string;

  @Column({ name: 'workflow_version_id', type: 'uuid' })
  workflowVersionId!: string;

  @Column({ name: 'step_key', type: 'varchar', length: 64 })
  stepKey!: string;

  @Column({ name: 'step_type', type: 'varchar', length: 32 })
  stepType!: WorkflowStepType;

  @Column({ type: 'varchar', length: 180 })
  label!: string;

  @Column({ name: 'step_order', type: 'int' })
  stepOrder!: number;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  config!: Record<string, unknown>;

  @Column({ name: 'branch_group', type: 'varchar', length: 64, nullable: true })
  branchGroup!: string | null;

  @Column({ name: 'parallel_group', type: 'varchar', length: 64, nullable: true })
  parallelGroup!: string | null;

  @Column({ name: 'on_error_path', type: 'varchar', length: 64, nullable: true })
  onErrorPath!: string | null;

  @Column({ name: 'next_on_success', type: 'varchar', length: 64, nullable: true })
  nextOnSuccess!: string | null;

  @Column({ name: 'next_on_failure', type: 'varchar', length: 64, nullable: true })
  nextOnFailure!: string | null;

  @Column({ name: 'max_retries', type: 'int', default: 3 })
  maxRetries!: number;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;
}
