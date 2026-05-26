import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CustomerEntity } from '../../loyalty/entities/customer.entity';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';

@Entity('customer_saved_items')
@Index(['tenantId', 'customerId'])
@Index(['tenantId', 'customerId', 'productId', 'variantId'], { unique: true })
export class CustomerSavedItemEntity extends BaseTenantScopedEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'variant_id', type: 'uuid', nullable: true })
  variantId!: string | null;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  label!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;
}
