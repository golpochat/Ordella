import { PromotionApplicationEntity } from './promotion-application.entity';
import { PromotionConditionEntity } from './promotion-condition.entity';
import { PromotionRuleEntity } from './promotion-rule.entity';
import { PromotionEntity } from './promotion.entity';

export { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
export { BaseTimestampsEntity } from './base-timestamps.entity';
export { PromotionApplicationEntity } from './promotion-application.entity';
export { PromotionConditionEntity } from './promotion-condition.entity';
export { PromotionRuleEntity } from './promotion-rule.entity';
export { PromotionEntity } from './promotion.entity';

export const PROMOTIONS_ENTITIES = [
  PromotionApplicationEntity,
  PromotionConditionEntity,
  PromotionRuleEntity,
  PromotionEntity,
];
