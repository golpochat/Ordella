import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdatePromotionConditionDto {
  @IsOptional()
  @IsString()
  operator?: string;

  @IsOptional()
  @IsObject()
  value?: Record<string, unknown>;
}
