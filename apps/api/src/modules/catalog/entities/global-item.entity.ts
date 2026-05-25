import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { GlobalCategoryEntity } from './global-category.entity';

@Entity('global_items')
@Index(['brandGroupId', 'name'])
@Index(['brandGroupId', 'sku'])
export class GlobalItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'brand_group_id', type: 'uuid' })
  brandGroupId!: string;

  @Column({ name: 'global_category_id', type: 'uuid', nullable: true })
  globalCategoryId!: string | null;

  @ManyToOne(() => GlobalCategoryEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'global_category_id' })
  globalCategory!: GlobalCategoryEntity | null;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'base_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  basePrice!: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  sku!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  barcode!: string | null;

  @Column({ name: 'tax_category_id', type: 'uuid', nullable: true })
  taxCategoryId!: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 2048, nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  attributes!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
