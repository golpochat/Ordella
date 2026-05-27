import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';

@Entity('workflows')
@Index(['tenantId', 'name'])
export class WorkflowEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 180 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status!: WorkflowStatus;

  @Column({ name: 'current_version', type: 'int', default: 1 })
  currentVersion!: number;

  @Column({ name: 'sandbox_mode', type: 'boolean', default: false })
  sandboxMode!: boolean;

  @Column({ name: 'allowed_roles', type: 'text', array: true, default: () => "'{}'" })
  allowedRoles!: string[];

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
