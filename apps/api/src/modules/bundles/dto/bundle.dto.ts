import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { BundlePriceType } from '../entities';

export class BundleItemDto {
  @IsUUID()
  itemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  minSelect?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxSelect?: number;
}

export class CreateBundleDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(BundlePriceType)
  priceType!: BundlePriceType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  items!: BundleItemDto[];
}

export class UpdateBundleDto extends CreateBundleDto {
  @IsUUID()
  id!: string;
}
