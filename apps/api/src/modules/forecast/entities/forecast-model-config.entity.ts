import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type ForecastModelType = 'simple' | 'exponential_smoothing' | 'ai_embedding';

@Entity('forecast_model_configs')
@Index(['tenantId', 'modelType', 'isActive'])
export class ForecastModelConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'model_type', type: 'varchar', length: 64 })
  modelType!: ForecastModelType;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  parameters!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
