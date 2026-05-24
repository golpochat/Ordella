import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { PromotionConditionType } from '../../enums/promotion-condition-type.enum';

export class CreatePromotionConditionDto {
  @IsUUID()
  promotionId!: string;

  @IsEnum(PromotionConditionType)
  conditionType!: PromotionConditionType;

  @IsOptional()
  @IsString()
  operator?: string;

  @IsObject()
  value!: Record<string, unknown>;
}
