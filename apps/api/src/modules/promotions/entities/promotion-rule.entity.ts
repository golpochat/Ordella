import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { PromotionRuleType } from '../enums/promotion-rule-type.enum';
import { BaseTimestampsEntity } from './base-timestamps.entity';
import { PromotionEntity } from './promotion.entity';

/** SRS §12 / §47 — stacking and rules engine */
@Entity('promotion_rules')
@Index(['promotionId', 'priority'])
export class PromotionRuleEntity extends BaseTimestampsEntity {
  @Column({ name: 'promotion_id', type: 'uuid' })
  promotionId!: string;

  @ManyToOne(() => PromotionEntity, (promotion) => promotion.rules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'promotion_id' })
  promotion!: PromotionEntity;

  @Column({ name: 'rule_type', type: 'varchar', length: 32 })
  ruleType!: PromotionRuleType;

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({ type: 'jsonb', default: {} })
  config!: Record<string, unknown>;

  @Column({ name: 'is_stackable', type: 'boolean', default: false })
  isStackable!: boolean;
}
