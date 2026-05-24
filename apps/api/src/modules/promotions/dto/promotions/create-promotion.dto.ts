import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PromotionType } from '../../enums/promotion-type.enum';

/** API Spec §9.1 POST /api/v1/promotions */
export class CreatePromotionDto {
  @IsString()
  name!: string;

  @IsEnum(PromotionType)
  type!: PromotionType;

  @IsString()
  value!: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
