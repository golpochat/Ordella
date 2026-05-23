import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolePermissionEntity } from './role-permission.entity';

/** Global permission catalog (ERD — no tenant_id). */
@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 128, unique: true })
  key!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => RolePermissionEntity, (rp) => rp.permission)
  rolePermissions!: RolePermissionEntity[];
}
