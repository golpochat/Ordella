import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimestampsEntity } from './base-timestamps.entity';
import { ProductEntity } from './product.entity';

/** ERD §1.2 — variants */
@Entity('variants')
@Index(['productId', 'sku'], { unique: true })
export class VariantEntity extends BaseTimestampsEntity {
  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => ProductEntity, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: ProductEntity;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'price_delta', type: 'decimal', precision: 12, scale: 2, default: 0 })
  priceDelta!: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  sku!: string | null;
}
