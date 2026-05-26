import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ai_automation_settings')
@Index(['tenantId', 'automationType'], { unique: true })
export class AiAutomationSettingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'automation_type', type: 'varchar', length: 64 })
  automationType!: 'purchase_orders' | 'staffing_templates' | 'marketing_campaigns' | 'dynamic_pricing' | 'notifications' | 'support_replies';

  @Column({ name: 'is_enabled', type: 'boolean', default: false })
  isEnabled!: boolean;

  @Column({ name: 'requires_approval', type: 'boolean', default: true })
  requiresApproval!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  thresholds!: Record<string, unknown>;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
