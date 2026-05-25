import { CustomerEntity } from './customer.entity';
import { LoyaltySettingsEntity } from './loyalty-settings.entity';
import { LoyaltyTransactionEntity } from './loyalty-transaction.entity';

export { CustomerEntity } from './customer.entity';
export { LoyaltySettingsEntity } from './loyalty-settings.entity';
export { LoyaltyTransactionEntity } from './loyalty-transaction.entity';
export { LoyaltyTransactionType } from './loyalty-transaction-type.enum';

export const LOYALTY_ENTITIES = [CustomerEntity, LoyaltySettingsEntity, LoyaltyTransactionEntity];
