import { Column, Entity, Index, OneToMany } from 'typeorm';
import { PromotionStatus } from '../enums/promotion-status.enum';
import { PromotionType } from '../enums/promotion-type.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { PromotionApplicationEntity } from './promotion-application.entity';
import { PromotionConditionEntity } from './promotion-condition.entity';
import { PromotionRuleEntity } from './promotion-rule.entity';

/** ERD §1.8 — API Spec §9.1 */
@Entity('promotions')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'startDate', 'endDate'])
export class PromotionEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 128 })
  name!: string;

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

  @Column({ name: 'usage_limit', type: 'int', nullable: true })
  usageLimit!: number | null;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => PromotionRuleEntity, (rule) => rule.promotion)
  rules!: PromotionRuleEntity[];

  @OneToMany(() => PromotionConditionEntity, (condition) => condition.promotion)
  conditions!: PromotionConditionEntity[];

  @OneToMany(() => PromotionApplicationEntity, (application) => application.promotion)
  applications!: PromotionApplicationEntity[];
}
