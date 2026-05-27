import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('digital_twin_versions')
@Index(['tenantId', 'twinId', 'version'], { unique: true })
export class DigitalTwinVersionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'twin_id', type: 'uuid' })
  twinId!: string;

  @Column({ type: 'int' })
  version!: number;

  @Column({ name: 'baseline_data', type: 'jsonb', default: () => "'{}'" })
  baselineData!: Record<string, unknown>;

  @Column({ name: 'simulation_parameters', type: 'jsonb', default: () => "'{}'" })
  simulationParameters!: Record<string, unknown>;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
