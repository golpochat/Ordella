import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type WorkflowTriggerType = 'schedule' | 'event' | 'manual' | 'api';

@Entity('workflow_triggers')
@Index(['tenantId', 'workflowId', 'triggerType'])
export class WorkflowTriggerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'workflow_id', type: 'uuid' })
  workflowId!: string;

  @Column({ name: 'trigger_type', type: 'varchar', length: 32 })
  triggerType!: WorkflowTriggerType;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  config!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'last_fired_at', type: 'timestamptz', nullable: true })
  lastFiredAt!: Date | null;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
