import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type AiActionStatus = 'pending_approval' | 'approved' | 'rejected' | 'executed' | 'failed';

@Entity('ai_action_requests')
@Index(['tenantId', 'status', 'createdAt'])
@Index(['tenantId', 'actionType'])
export class AiActionRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'conversation_id', type: 'uuid', nullable: true })
  conversationId!: string | null;

  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId!: string | null;

  @Column({ name: 'action_type', type: 'varchar', length: 64 })
  actionType!: 'generate_purchase_order' | 'adjust_staffing_template' | 'create_marketing_campaign' | 'apply_dynamic_pricing' | 'trigger_notification' | 'suggest_support_reply' | 'suggest_loyalty_reward';

  @Column({ type: 'varchar', length: 24, default: 'pending_approval' })
  status!: AiActionStatus;

  @Column({ name: 'risk_level', type: 'varchar', length: 16, default: 'medium' })
  riskLevel!: 'low' | 'medium' | 'high' | 'critical';

  @Column({ type: 'jsonb', default: () => "'{}'" })
  payload!: Record<string, unknown>;

  @Column({ name: 'approval_note', type: 'text', nullable: true })
  approvalNote!: string | null;

  @Column({ name: 'approved_by_user_id', type: 'uuid', nullable: true })
  approvedByUserId!: string | null;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt!: Date | null;

  @Column({ name: 'executed_at', type: 'timestamptz', nullable: true })
  executedAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
