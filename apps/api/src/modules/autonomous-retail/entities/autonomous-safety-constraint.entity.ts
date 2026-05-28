import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('autonomous_safety_constraints')
@Index(['tenantId', 'constraintKey'], { unique: true })
export class AutonomousSafetyConstraintEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'constraint_key', type: 'varchar', length: 64 })
  constraintKey!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 180 })
  displayName!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  rules!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
