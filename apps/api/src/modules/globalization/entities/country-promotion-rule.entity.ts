import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('country_promotion_rules')
@Index(['tenantId', 'countryCode', 'promotionId'], { unique: true })
export class CountryPromotionRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'country_code', type: 'varchar', length: 2 })
  countryCode!: string;

  @Column({ name: 'promotion_id', type: 'uuid', nullable: true })
  promotionId!: string | null;

  @Column({ type: 'varchar', length: 8 })
  currency!: string;

  @Column({ name: 'discount_type', type: 'varchar', length: 32, default: 'percent' })
  discountType!: 'percent' | 'fixed';

  @Column({ name: 'discount_value', type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountValue!: string;

  @Column({ name: 'tax_aware', type: 'boolean', default: true })
  taxAware!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
