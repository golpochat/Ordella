import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsUUID, Min } from 'class-validator';
import { PromotionRuleType } from '../../enums/promotion-rule-type.enum';

export class CreatePromotionRuleDto {
  @IsUUID()
  promotionId!: string;

  @IsEnum(PromotionRuleType)
  ruleType!: PromotionRuleType;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isStackable?: boolean;
}
