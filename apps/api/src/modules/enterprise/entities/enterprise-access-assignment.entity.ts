import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type EnterpriseScopeType = 'organization' | 'region' | 'location';

@Entity('enterprise_access_assignments')
@Index(['tenantId', 'userId', 'scopeType'])
@Index(['tenantId', 'regionId'])
@Index(['tenantId', 'locationId'])
export class EnterpriseAccessAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId!: string | null;

  @Column({ name: 'scope_type', type: 'varchar', length: 32 })
  scopeType!: EnterpriseScopeType;

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId!: string | null;

  @Column({ name: 'region_id', type: 'uuid', nullable: true })
  regionId!: string | null;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId!: string | null;

  @Column({ name: 'staff_role', type: 'varchar', length: 48, default: 'regional_manager' })
  staffRole!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
