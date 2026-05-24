import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { ProductEntity } from './product.entity';

/** ERD §1.2 — categories */
@Entity('categories')
@Index(['tenantId', 'name'])
export class CategoryEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @OneToMany(() => ProductEntity, (product) => product.category)
  products!: ProductEntity[];
}
