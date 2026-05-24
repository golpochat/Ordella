import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ActionType } from '../enums/action-type.enum';
import { BaseTimestampsEntity } from './base-timestamps.entity';
import { PromotionEntity } from './promotion.entity';

@Entity('promotion_actions')
@Index(['promotionId'])
export class PromotionActionEntity extends BaseTimestampsEntity {
  @Column({ name: 'promotion_id', type: 'uuid' })
  promotionId!: string;

  @ManyToOne(() => PromotionEntity, (promotion) => promotion.actions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'promotion_id' })
  promotion!: PromotionEntity;

  @Column({ name: 'action_type', type: 'varchar', length: 32 })
  actionType!: ActionType;

  @Column({ name: 'action_config', type: 'jsonb', default: {} })
  actionConfig!: Record<string, unknown>;
}
