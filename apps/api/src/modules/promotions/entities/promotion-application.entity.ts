import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { PromotionApplicationStatus } from '../enums/promotion-application-status.enum';
import { BaseTimestampsEntity } from './base-timestamps.entity';
import { PromotionEntity } from './promotion.entity';

/** SRS §47 — applied / redeemed tracking */
@Entity('promotion_applications')
@Index(['promotionId', 'createdAt'])
@Index(['orderId'])
export class PromotionApplicationEntity extends BaseTimestampsEntity {
  @Column({ name: 'promotion_id', type: 'uuid' })
  promotionId!: string;

  @ManyToOne(() => PromotionEntity, (promotion) => promotion.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'promotion_id' })
  promotion!: PromotionEntity;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId!: string | null;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId!: string | null;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 2 })
  discountAmount!: string;

  @Column({ type: 'varchar', length: 32, default: PromotionApplicationStatus.APPLIED })
  status!: PromotionApplicationStatus;

  @Column({ name: 'applied_at', type: 'timestamptz', default: () => 'NOW()' })
  appliedAt!: Date;
}
