import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';
import { BundleItemEntity } from './bundle-item.entity';
import { BundlePriceType } from './bundle.enums';

@Entity('bundles')
@Index(['tenantId', 'isActive'])
@Index(['tenantId', 'locationId'])
export class BundleEntity extends BaseTenantScopedEntity {
  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId!: string | null;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'price_type', type: 'varchar', length: 32, default: BundlePriceType.DYNAMIC })
  priceType!: BundlePriceType;

  @Column({ name: 'fixed_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  fixedPrice!: string | null;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  discountAmount!: string | null;

  @Column({ name: 'discount_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercent!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => BundleItemEntity, (item) => item.bundle)
  items!: BundleItemEntity[];
}
