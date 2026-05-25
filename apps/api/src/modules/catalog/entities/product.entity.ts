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

  @Column({ type: 'varchar', length: 128, nullable: true })
  sku!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  barcode!: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 2048, nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'inventory_tracking_enabled', type: 'boolean', default: false })
  inventoryTrackingEnabled!: boolean;

  @Column({ name: 'stock_level', type: 'int', nullable: true })
  stockLevel!: number | null;

  @Column({ name: 'tax_category_id', type: 'uuid', nullable: true })
  taxCategoryId!: string | null;

  @OneToMany(() => VariantEntity, (variant) => variant.product)
  variants!: VariantEntity[];
}
