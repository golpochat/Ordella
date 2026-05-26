import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ai_insights')
@Index(['tenantId', 'category', 'severity'])
export class AiInsightEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 48 })
  category!: 'inventory' | 'customers' | 'promotions' | 'delivery' | 'staffing' | 'forecasting' | 'support' | 'sales';

  @Column({ type: 'varchar', length: 16, default: 'medium' })
  severity!: 'low' | 'medium' | 'high' | 'critical';

  @Column({ type: 'varchar', length: 180 })
  title!: string;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ name: 'recommended_action', type: 'text', nullable: true })
  recommendedAction!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 24, default: 'open' })
  status!: 'open' | 'dismissed' | 'converted';

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
