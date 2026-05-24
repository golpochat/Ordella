import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StaffInvitationStatus } from '../enums/staff-invitation-status.enum';
import { RoleEntity } from '../../auth/entities/role.entity';
import { UserEntity } from '../../auth/entities/user.entity';
import { TenantEntity } from '../../tenants/entities/tenant.entity';

@Entity('staff_invitations')
@Index(['tenantId', 'email'])
export class StaffInvitationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId!: string;

  @ManyToOne(() => RoleEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role!: RoleEntity;

  @Column({ name: 'invited_by', type: 'uuid', nullable: true })
  invitedBy!: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'invited_by' })
  inviter!: UserEntity | null;

  @Column({ type: 'varchar', length: 32, default: StaffInvitationStatus.PENDING })
  status!: StaffInvitationStatus;

  @Column({ type: 'varchar', length: 128, unique: true })
  token!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
