import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type SimulationRunStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'cached';

export type SimulationDomain =
  | 'demand'
  | 'inventory'
  | 'staffing'
  | 'delivery'
  | 'pricing'
  | 'promotion'
  | 'customer_behavior'
  | 'full';

@Entity('simulation_runs')
@Index(['tenantId', 'twinId', 'startedAt'])
export class SimulationRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'twin_id', type: 'uuid' })
  twinId!: string;

  @Column({ name: 'scenario_id', type: 'uuid', nullable: true })
  scenarioId!: string | null;

  @Column({ name: 'simulation_domain', type: 'varchar', length: 64, default: 'full' })
  simulationDomain!: SimulationDomain;

  @Column({ type: 'varchar', length: 32 })
  status!: SimulationRunStatus;

  @Column({ name: 'reproducibility_seed', type: 'varchar', length: 64 })
  reproducibilitySeed!: string;

  @Column({ name: 'cache_key', type: 'varchar', length: 128, nullable: true })
  cacheKey!: string | null;

  @Column({ name: 'batch_id', type: 'uuid', nullable: true })
  batchId!: string | null;

  @Column({ name: 'sandbox_mode', type: 'boolean', default: true })
  sandboxMode!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  parameters!: Record<string, unknown>;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt!: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt!: Date | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;
}
