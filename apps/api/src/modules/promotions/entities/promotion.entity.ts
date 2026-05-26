import { Column, Entity, Index, OneToMany } from 'typeorm';
import { PromotionStatus } from '../enums/promotion-status.enum';
import { PromotionType } from '../enums/promotion-type.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { PromotionApplicationEntity } from './promotion-application.entity';
import { PromotionConditionEntity } from './promotion-condition.entity';
import { PromotionRuleEntity } from './promotion-rule.entity';
import { PromotionActionEntity } from './promotion-action.entity';

/** ERD §1.8 — API Spec §9.1 */
@Entity('promotions')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'startDate', 'endDate'])
export class PromotionEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 32 })
  type!: PromotionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  value!: string;

  @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
  startDate!: Date | null;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate!: Date | null;

  @Column({ type: 'varchar', length: 32, default: PromotionStatus.DRAFT })
  status!: PromotionStatus;

  @Column({ type: 'varchar', length: 64, nullable: true })
  code!: string | null;

  @Column({ name: 'buy_quantity', type: 'int', nullable: true })
  buyQuantity!: number | null;

  @Column({ name: 'get_quantity', type: 'int', nullable: true })
  getQuantity!: number | null;

  @Column({ name: 'min_spend', type: 'decimal', precision: 12, scale: 2, nullable: true })
  minSpend!: string | null;

  @Column({ name: 'applicable_locations', type: 'uuid', array: true, default: () => "'{}'" })
  applicableLocations!: string[];

  @Column({ name: 'applicable_categories', type: 'uuid', array: true, default: () => "'{}'" })
  applicableCategories!: string[];

  @Column({ name: 'applicable_items', type: 'uuid', array: true, default: () => "'{}'" })
  applicableItems!: string[];

  @Column({ name: 'auto_apply', type: 'boolean', default: true })
  autoApply!: boolean;

  @Column({ type: 'varchar', length: 16, default: 'both' })
  channel!: 'pos' | 'online' | 'both';

  @Column({ name: 'usage_limit', type: 'int', nullable: true })
  usageLimit!: number | null;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount!: number;

  @Column({ type: 'int', default: 100 })
  priority!: number;

  @Column({ type: 'boolean', default: false })
  stackable!: boolean;

  @Column({ name: 'conflict_strategy', type: 'varchar', length: 32, default: 'best_price' })
  conflictStrategy!: 'best_price' | 'priority' | 'exclusive';

  @Column({ name: 'eligible_customer_segments', type: 'varchar', array: true, default: () => "'{}'" })
  eligibleCustomerSegments!: string[];

  @Column({ name: 'dynamic_pricing_rules', type: 'jsonb', default: () => "'{}'" })
  dynamicPricingRules!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @OneToMany(() => PromotionRuleEntity, (rule) => rule.promotion)
  rules!: PromotionRuleEntity[];

  @OneToMany(() => PromotionActionEntity, (action) => action.promotion)
  actions!: PromotionActionEntity[];

  @OneToMany(() => PromotionConditionEntity, (condition) => condition.promotion)
  conditions!: PromotionConditionEntity[];

  @OneToMany(() => PromotionApplicationEntity, (application) => application.promotion)
  applications!: PromotionApplicationEntity[];
}
