import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('simulation_results')
@Index(['tenantId', 'simulationRunId'], { unique: true })
export class SimulationResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'simulation_run_id', type: 'uuid' })
  simulationRunId!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  kpis!: Record<string, number>;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  charts!: Array<{ key: string; label: string; series: Array<{ x: string; y: number }> }>;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metrics!: Record<string, unknown>;

  @Column({ name: 'baseline_deltas', type: 'jsonb', default: () => "'{}'" })
  baselineDeltas!: Record<string, number>;

  @Column({ name: 'risk_analysis', type: 'jsonb', default: () => "'[]'" })
  riskAnalysis!: Array<Record<string, unknown>>;

  @Column({ name: 'recommended_actions', type: 'jsonb', default: () => "'[]'" })
  recommendedActions!: Array<Record<string, unknown>>;

  @Column({ name: 'confidence_intervals', type: 'jsonb', default: () => "'{}'" })
  confidenceIntervals!: Record<string, { low: number; high: number }>;

  @Column({ name: 'ai_explanation', type: 'text', nullable: true })
  aiExplanation!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
