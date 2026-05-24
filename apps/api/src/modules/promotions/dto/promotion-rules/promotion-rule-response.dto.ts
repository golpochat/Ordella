import { PromotionRuleType } from '../../enums/promotion-rule-type.enum';

export class PromotionRuleResponseDto {
  id!: string;
  promotionId!: string;
  ruleType!: PromotionRuleType;
  priority!: number;
  config!: Record<string, unknown>;
  isStackable!: boolean;
  createdAt!: Date;
  updatedAt!: Date | null;
}
