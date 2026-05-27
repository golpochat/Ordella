import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('country_price_lists')
@Index(['tenantId', 'countryCode', 'productId'], { unique: true })
export class CountryPriceListEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'country_code', type: 'varchar', length: 2 })
  countryCode!: string;

  @Column({ type: 'varchar', length: 8 })
  currency!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: string;

  @Column({ name: 'compare_at_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  compareAtPrice!: string | null;

  @Column({ name: 'tax_inclusive', type: 'boolean', default: false })
  taxInclusive!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
