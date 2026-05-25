import { GiftCardEntity } from './gift-card.entity';
import { GiftCardTransactionEntity } from './gift-card-transaction.entity';
import { StoreCreditTransactionEntity } from './store-credit-transaction.entity';

export { GiftCardEntity } from './gift-card.entity';
export { GiftCardTransactionEntity } from './gift-card-transaction.entity';
export {
  GiftCardTransactionType,
  StoreCreditTransactionType,
} from './gift-card-transaction-type.enum';
export { StoreCreditTransactionEntity } from './store-credit-transaction.entity';

export const GIFT_CARD_ENTITIES = [
  GiftCardEntity,
  GiftCardTransactionEntity,
  StoreCreditTransactionEntity,
];
