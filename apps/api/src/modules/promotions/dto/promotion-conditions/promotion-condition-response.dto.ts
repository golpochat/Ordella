import { PromotionConditionType } from '../../enums/promotion-condition-type.enum';

export class PromotionConditionResponseDto {
  id!: string;
  promotionId!: string;
  conditionType!: PromotionConditionType;
  operator!: string;
  value!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date | null;
}
