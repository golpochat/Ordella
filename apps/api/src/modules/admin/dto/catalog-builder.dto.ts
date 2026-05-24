import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductStatus } from '../../catalog/enums/product-status.enum';
import { ModifierType } from '../../catalog/enums/modifier-type.enum';

export class CatalogCategoryCreateDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CatalogCategoryUpdateDto {
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CatalogCategoryDeleteDto {
  @IsUUID()
  id!: string;
}

export class CatalogItemCreateDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  price!: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  sku?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  barcode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @IsOptional()
  status?: ProductStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  inventoryTrackingEnabled?: boolean;

  @IsOptional()
  @IsInt()
  stockLevel?: number;

  @IsOptional()
  channelVisibility?: Record<string, boolean>;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  modifierIds?: string[];
}

export class CatalogItemUpdateDto extends CatalogItemCreateDto {
  @IsUUID()
  id!: string;
}

export class CatalogItemDeleteDto {
  @IsUUID()
  id!: string;
}

export class CatalogItemImageDto {
  @IsUUID()
  itemId!: string;

  @IsString()
  @MaxLength(2048)
  imageUrl!: string;
}

export class CatalogVariantDto {
  @IsUUID()
  itemId!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  priceDelta?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  sku?: string;
}

export class CatalogModifierOptionDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  priceDelta?: string;
}

export class CatalogItemAddModifierDto {
  @IsUUID()
  itemId!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  type?: ModifierType;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsUUID()
  modifierId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CatalogModifierOptionDto)
  options?: CatalogModifierOptionDto[];
}

export class CatalogListItemsQueryDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  channel?: string;
}
