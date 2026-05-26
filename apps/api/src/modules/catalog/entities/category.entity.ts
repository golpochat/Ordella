import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { ProductEntity } from './product.entity';

/** ERD §1.2 — categories */
@Entity('categories')
@Index(['tenantId', 'name'])
export class CategoryEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'global_category_id', type: 'uuid', nullable: true })
  globalCategoryId!: string | null;

  @Column({ name: 'tax_category_id', type: 'uuid', nullable: true })
  taxCategoryId!: string | null;

  @OneToMany(() => ProductEntity, (product) => product.category)
  products!: ProductEntity[];
}
