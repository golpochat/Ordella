import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ModifierEntity } from './modifier.entity';
import { ProductEntity } from './product.entity';

@Entity('product_modifiers')
@Index(['tenantId', 'productId'])
@Index(['productId', 'modifierId'], { unique: true })
export class ProductModifierEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: ProductEntity;

  @Column({ name: 'modifier_id', type: 'uuid' })
  modifierId!: string;

  @ManyToOne(() => ModifierEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modifier_id' })
  modifier!: ModifierEntity;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
