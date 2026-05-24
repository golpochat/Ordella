import { Column, Entity, Index } from 'typeorm';
import { PaymentMethodType } from '../enums/payment-method-type.enum';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';

/** SRS §9 — saved / configured payment methods */
@Entity('payment_methods')
@Index(['tenantId', 'customerId'])
export class PaymentMethodEntity extends BaseTenantScopedEntity {
  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId!: string | null;

  @Column({ type: 'varchar', length: 32 })
  type!: PaymentMethodType;

  @Column({ type: 'varchar', length: 32 })
  provider!: PaymentProvider;

  @Column({ name: 'display_label', type: 'varchar', length: 128, nullable: true })
  displayLabel!: string | null;

  @Column({ name: 'last_four', type: 'varchar', length: 4, nullable: true })
  lastFour!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  brand!: string | null;

  @Column({ name: 'provider_token', type: 'varchar', length: 255, nullable: true })
  providerToken!: string | null;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
