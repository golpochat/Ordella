import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseTenantEntity } from './base-tenant.entity';
import { UserEntity } from './user.entity';
import { RolePermissionEntity } from './role-permission.entity';

@Entity('roles')
@Index(['tenantId', 'name'], { unique: true })
export class RoleEntity extends BaseTenantEntity {
  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @OneToMany(() => UserEntity, (user) => user.role)
  users!: UserEntity[];

  @OneToMany(() => RolePermissionEntity, (rp) => rp.role)
  rolePermissions!: RolePermissionEntity[];
}
