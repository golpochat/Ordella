import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('simulation_cache')
@Index(['tenantId', 'cacheKey'], { unique: true })
export class SimulationCacheEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'cache_key', type: 'varchar', length: 128 })
  cacheKey!: string;

  @Column({ name: 'simulation_run_id', type: 'uuid' })
  simulationRunId!: string;

  @Column({ name: 'result_hash', type: 'varchar', length: 64 })
  resultHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
