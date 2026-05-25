import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserStatus } from '../enums/user-status.enum';
import { BaseTenantEntity } from './base-tenant.entity';
import { RoleEntity } from './role.entity';
import { SessionEntity } from './session.entity';
import { UserDeviceEntity } from './user-device.entity';
import { MfaFactorEntity } from './mfa-factor.entity';

@Entity('users')
@Index(['tenantId', 'email'], { unique: true })
export class UserEntity extends BaseTenantEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ name: 'pin_hash', type: 'varchar', length: 255, nullable: true })
  pinHash!: string | null;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId!: string;

  @ManyToOne(() => RoleEntity, (role) => role.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role!: RoleEntity;

  @Column({ name: 'mfa_enabled', type: 'boolean', default: false })
  mfaEnabled!: boolean;

  @Column({ type: 'varchar', length: 32, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions!: SessionEntity[];

  @OneToMany(() => UserDeviceEntity, (device) => device.user)
  devices!: UserDeviceEntity[];

  @OneToMany(() => MfaFactorEntity, (mfa) => mfa.user)
  mfaFactors!: MfaFactorEntity[];
}
