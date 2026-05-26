import { CustomerEntity } from './customer.entity';
import { LoyaltyPointsEntity } from './loyalty-points.entity';
import { LoyaltyReferralEntity } from './loyalty-referral.entity';
import { LoyaltyRewardEntity } from './loyalty-reward.entity';
import { LoyaltySettingsEntity } from './loyalty-settings.entity';
import { LoyaltyTierEntity } from './loyalty-tier.entity';
import { LoyaltyTransactionEntity } from './loyalty-transaction.entity';

export { CustomerEntity } from './customer.entity';
export { LoyaltyPointsEntity } from './loyalty-points.entity';
export { LoyaltyReferralEntity } from './loyalty-referral.entity';
export { LoyaltyRewardEntity, type LoyaltyRewardType } from './loyalty-reward.entity';
export { LoyaltySettingsEntity } from './loyalty-settings.entity';
export { LoyaltyTierEntity } from './loyalty-tier.entity';
export { LoyaltyTransactionEntity } from './loyalty-transaction.entity';
export { LoyaltyTransactionType } from './loyalty-transaction-type.enum';

export const LOYALTY_ENTITIES = [
  CustomerEntity,
  LoyaltyPointsEntity,
  LoyaltyReferralEntity,
  LoyaltyRewardEntity,
  LoyaltySettingsEntity,
  LoyaltyTierEntity,
  LoyaltyTransactionEntity,
];
