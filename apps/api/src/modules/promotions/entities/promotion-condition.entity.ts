import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { PromotionConditionType } from '../enums/promotion-condition-type.enum';
import { BaseTimestampsEntity } from './base-timestamps.entity';
import { PromotionEntity } from './promotion.entity';

/** SRS §12 — eligibility rules */
@Entity('promotion_conditions')
@Index(['promotionId', 'conditionType'])
export class PromotionConditionEntity extends BaseTimestampsEntity {
  @Column({ name: 'promotion_id', type: 'uuid' })
  promotionId!: string;

  @ManyToOne(() => PromotionEntity, (promotion) => promotion.conditions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'promotion_id' })
  promotion!: PromotionEntity;

  @Column({ name: 'condition_type', type: 'varchar', length: 32 })
  conditionType!: PromotionConditionType;

  @Column({ type: 'varchar', length: 16, default: 'eq' })
  operator!: string;

  @Column({ type: 'jsonb', default: {} })
  value!: Record<string, unknown>;
}
