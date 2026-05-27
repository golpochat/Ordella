import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type AutonomousActionStatus = 'pending' | 'executing' | 'succeeded' | 'failed' | 'rolled_back' | 'blocked';

@Entity('autonomous_actions')
@Index(['tenantId', 'createdAt'])
export class AutonomousActionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'decision_id', type: 'uuid', nullable: true })
  decisionId!: string | null;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId!: string | null;

  @Column({ name: 'action_type', type: 'varchar', length: 64 })
  actionType!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: AutonomousActionStatus;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  payload!: Record<string, unknown>;

  @Column({ name: 'rollback_payload', type: 'jsonb', nullable: true })
  rollbackPayload!: Record<string, unknown> | null;

  @Column({ name: 'executed_by', type: 'varchar', length: 32, default: 'system' })
  executedBy!: 'system' | 'human_override';

  @Column({ name: 'approved_by_user_id', type: 'uuid', nullable: true })
  approvedByUserId!: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'executed_at', type: 'timestamptz', nullable: true })
  executedAt!: Date | null;

  @Column({ name: 'rolled_back_at', type: 'timestamptz', nullable: true })
  rolledBackAt!: Date | null;
}
