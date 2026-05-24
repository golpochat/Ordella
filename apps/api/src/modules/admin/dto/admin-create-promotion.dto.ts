import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PromotionType } from '../../promotions/enums/promotion-type.enum';

export class AdminCreatePromotionDto {
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
