import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { OrderEntity } from '../../orders/entities/order.entity';
import { BaseTimestampsEntity } from './base-timestamps.entity';
import { GiftCardEntity } from './gift-card.entity';
import { GiftCardTransactionType } from './gift-card-transaction-type.enum';

@Entity('gift_card_transactions')
@Index(['giftCardId', 'createdAt'])
export class GiftCardTransactionEntity extends BaseTimestampsEntity {
  @Column({ name: 'gift_card_id', type: 'uuid' })
  giftCardId!: string;

  @ManyToOne(() => GiftCardEntity, (giftCard) => giftCard.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gift_card_id' })
  giftCard!: GiftCardEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 32 })
  type!: GiftCardTransactionType;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId!: string | null;

  @ManyToOne(() => OrderEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order!: OrderEntity | null;
}
