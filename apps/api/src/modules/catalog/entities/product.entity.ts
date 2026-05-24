import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductStatus } from '../enums/product-status.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { CategoryEntity } from './category.entity';
import { VariantEntity } from './variant.entity';

/** ERD §1.2 — products */
@Entity('products')
@Index(['tenantId', 'name'])
export class ProductEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId!: string | null;

  @ManyToOne(() => CategoryEntity, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category!: CategoryEntity | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price!: string;

  @Column({ type: 'varchar', length: 32, default: ProductStatus.DRAFT })
  status!: ProductStatus;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  /** SRS §3.4 — channel visibility placeholder (pos, online, whatsapp) */
  @Column({ name: 'channel_visibility', type: 'jsonb', default: {} })
  channelVisibility!: Record<string, boolean>;

  @OneToMany(() => VariantEntity, (variant) => variant.product)
  variants!: VariantEntity[];
}
