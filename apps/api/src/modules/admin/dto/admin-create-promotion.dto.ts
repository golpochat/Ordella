import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsObject,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { PromotionType } from '../../promotions/enums/promotion-type.enum';

export class AdminCreatePromotionDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

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
  buyQuantity?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  getQuantity?: number;

  @IsOptional()
  @IsString()
  minSpend?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  applicableLocations?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  applicableCategories?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  applicableItems?: string[];

  @IsOptional()
  @IsBoolean()
  autoApply?: boolean;

  @IsOptional()
  @IsIn(['pos', 'online', 'both'])
  channel?: 'pos' | 'online' | 'both';

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  stackable?: boolean;

  @IsOptional()
  @IsIn(['best_price', 'priority', 'exclusive'])
  conflictStrategy?: 'best_price' | 'priority' | 'exclusive';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eligibleCustomerSegments?: string[];

  @IsOptional()
  @IsObject()
  dynamicPricingRules?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
