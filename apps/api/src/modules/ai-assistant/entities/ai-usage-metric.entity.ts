import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ai_usage_metrics')
@Index(['tenantId', 'metricType', 'createdAt'])
export class AiUsageMetricEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'metric_type', type: 'varchar', length: 64 })
  metricType!: 'chat_message' | 'insight_generated' | 'action_proposed' | 'action_approved' | 'automation_executed' | 'accuracy_feedback';

  @Column({ type: 'int', default: 1 })
  count!: number;

  @Column({ name: 'estimated_savings_cents', type: 'int', default: 0 })
  estimatedSavingsCents!: number;

  @Column({ name: 'accuracy_score', type: 'decimal', precision: 6, scale: 4, nullable: true })
  accuracyScore!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
