import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('country_delivery_rules')
@Index(['tenantId', 'countryCode'], { unique: true })
export class CountryDeliveryRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'country_code', type: 'varchar', length: 2 })
  countryCode!: string;

  @Column({ type: 'varchar', length: 8 })
  currency!: string;

  @Column({ name: 'delivery_zones', type: 'jsonb', default: () => "'[]'" })
  deliveryZones!: Array<Record<string, unknown>>;

  @Column({ name: 'cross_border_allowed', type: 'boolean', default: false })
  crossBorderAllowed!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  restrictions!: Record<string, unknown>;

  @Column({ name: 'minimum_order_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  minimumOrderAmount!: string;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
