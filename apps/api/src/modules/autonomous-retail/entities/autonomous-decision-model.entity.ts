import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type DecisionModelType = 'pricing' | 'replenishment' | 'staffing' | 'promotion' | 'delivery';

@Entity('autonomous_decision_models')
@Index(['tenantId', 'modelType', 'version'], { unique: true })
export class AutonomousDecisionModelEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'model_type', type: 'varchar', length: 32 })
  modelType!: DecisionModelType;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @Column({ type: 'varchar', length: 180 })
  displayName!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  config!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
