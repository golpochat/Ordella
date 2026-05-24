import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ModifierType } from '../enums/modifier-type.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { ModifierOptionEntity } from './modifier-option.entity';

/** ERD §1.2 — modifiers */
@Entity('modifiers')
@Index(['tenantId', 'name'])
export class ModifierEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 32 })
  type!: ModifierType;

  @Column({ type: 'boolean', default: false })
  required!: boolean;

  @OneToMany(() => ModifierOptionEntity, (option) => option.modifier)
  options!: ModifierOptionEntity[];
}
