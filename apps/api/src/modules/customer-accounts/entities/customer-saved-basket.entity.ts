import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CustomerEntity } from '../../loyalty/entities/customer.entity';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';

@Entity('customer_saved_baskets')
@Index(['tenantId', 'customerId'])
export class CustomerSavedBasketEntity extends BaseTenantScopedEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity;

  @Column({ type: 'varchar', length: 120, default: 'Saved basket' })
  name!: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  items!: Array<Record<string, unknown>>;

  @Column({ name: 'item_count', type: 'int', default: 0 })
  itemCount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal!: string;

  @Column({ type: 'varchar', length: 3, default: 'EUR' })
  currency!: string;
}
