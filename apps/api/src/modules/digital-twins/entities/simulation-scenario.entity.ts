import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('simulation_scenarios')
@Index(['tenantId', 'twinId', 'name'], { unique: true })
export class SimulationScenarioEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'twin_id', type: 'uuid' })
  twinId!: string;

  @Column({ type: 'varchar', length: 180 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  parameters!: Record<string, unknown>;

  @Column({ name: 'forecast_overrides', type: 'jsonb', default: () => "'{}'" })
  forecastOverrides!: Record<string, unknown>;

  @Column({ name: 'extreme_conditions', type: 'jsonb', default: () => "'{}'" })
  extremeConditions!: Record<string, unknown>;

  @Column({ name: 'is_baseline', type: 'boolean', default: false })
  isBaseline!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
