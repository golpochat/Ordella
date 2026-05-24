import { IsBoolean, IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class UpdatePromotionRuleDto {
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
