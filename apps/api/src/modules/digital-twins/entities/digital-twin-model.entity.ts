import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type DigitalTwinType = 'store' | 'warehouse' | 'region' | 'customer_segment' | 'product_category';

@Entity('digital_twin_models')
@Index(['tenantId', 'name'])
export class DigitalTwinModelEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 180 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'twin_type', type: 'varchar', length: 64 })
  twinType!: DigitalTwinType;

  @Column({ name: 'entity_ref_id', type: 'uuid', nullable: true })
  entityRefId!: string | null;

  @Column({ name: 'current_version', type: 'int', default: 1 })
  currentVersion!: number;

  @Column({ name: 'baseline_data', type: 'jsonb', default: () => "'{}'" })
  baselineData!: Record<string, unknown>;

  @Column({ name: 'simulation_parameters', type: 'jsonb', default: () => "'{}'" })
  simulationParameters!: Record<string, unknown>;

  @Column({ name: 'allowed_roles', type: 'text', array: true, default: () => "'{manager,admin}'" })
  allowedRoles!: string[];

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: 'draft' | 'active' | 'archived';

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
