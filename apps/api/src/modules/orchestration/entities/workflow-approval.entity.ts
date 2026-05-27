import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type WorkflowApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated';

@Entity('workflow_approvals')
@Index(['tenantId', 'assigneeUserId', 'status'])
export class WorkflowApprovalEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'workflow_run_id', type: 'uuid' })
  workflowRunId!: string;

  @Column({ name: 'workflow_step_run_id', type: 'uuid' })
  workflowStepRunId!: string;

  @Column({ name: 'assignee_user_id', type: 'uuid' })
  assigneeUserId!: string;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: WorkflowApprovalStatus;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ name: 'escalation_level', type: 'int', default: 0 })
  escalationLevel!: number;

  @Column({ name: 'escalate_after_minutes', type: 'int', default: 60 })
  escalateAfterMinutes!: number;

  @Column({ name: 'due_at', type: 'timestamptz', nullable: true })
  dueAt!: Date | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
