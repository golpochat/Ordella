import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type AutonomousDecisionStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'rolled_back';

@Entity('autonomous_decisions')
@Index(['tenantId', 'status', 'createdAt'])
export class AutonomousDecisionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId!: string | null;

  @Column({ name: 'model_type', type: 'varchar', length: 32 })
  modelType!: string;

  @Column({ name: 'action_type', type: 'varchar', length: 64 })
  actionType!: string;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: AutonomousDecisionStatus;

  @Column({ type: 'decimal', precision: 6, scale: 4 })
  confidence!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  payload!: Record<string, unknown>;

  @Column({ type: 'text' })
  explanation!: string;

  @Column({ name: 'predicted_impact', type: 'jsonb', default: () => "'{}'" })
  predictedImpact!: Record<string, number>;

  @Column({ name: 'alternatives_considered', type: 'jsonb', default: () => "'[]'" })
  alternativesConsidered!: Array<Record<string, unknown>>;

  @Column({ name: 'twin_simulation_id', type: 'uuid', nullable: true })
  twinSimulationId!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
