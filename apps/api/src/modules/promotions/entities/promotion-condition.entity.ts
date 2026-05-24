import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { RuleType } from '../enums/rule-type.enum';
import { BaseTimestampsEntity } from './base-timestamps.entity';
import { PromotionEntity } from './promotion.entity';

/** PromotionRule — persisted as promotion_conditions (ruleType + ruleConfig) */
@Entity('promotion_conditions')
@Index(['promotionId', 'ruleType'])
export class PromotionConditionEntity extends BaseTimestampsEntity {
  @Column({ name: 'promotion_id', type: 'uuid' })
  promotionId!: string;

  @ManyToOne(() => PromotionEntity, (promotion) => promotion.conditions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'promotion_id' })
  promotion!: PromotionEntity;

  @Column({ name: 'condition_type', type: 'varchar', length: 32 })
  ruleType!: RuleType;

  @Column({ type: 'varchar', length: 16, default: 'eq' })
  operator!: string;

  @Column({ type: 'jsonb', default: {} })
  ruleConfig!: Record<string, unknown>;
}
