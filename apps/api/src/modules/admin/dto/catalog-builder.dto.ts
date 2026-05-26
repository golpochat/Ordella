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

  @IsOptional()
  @IsUUID()
  taxCategoryId?: string;
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

  @IsOptional()
  @IsUUID()
  taxCategoryId?: string | null;
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
  @IsUUID()
  taxCategoryId?: string;

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

export class GlobalCategoryCreateDto {
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
}

export class GlobalCategoryUpdateDto extends GlobalCategoryCreateDto {
  @IsUUID()
  id!: string;
}

export class GlobalItemCreateDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  basePrice!: string;

  @IsOptional()
  @IsUUID()
  globalCategoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  sku?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  barcode?: string;

  @IsOptional()
  @IsUUID()
  taxCategoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @IsOptional()
  attributes?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class GlobalItemUpdateDto extends GlobalItemCreateDto {
  @IsUUID()
  id!: string;
}

export class LocalCatalogOverrideDto {
  @IsUUID()
  globalItemId!: string;

  @IsOptional()
  @IsUUID()
  localItemId?: string;

  @IsOptional()
  @IsString()
  overridePrice?: string;

  @IsOptional()
  @IsString()
  overrideName?: string;

  @IsOptional()
  @IsString()
  overrideDescription?: string;

  @IsOptional()
  overrideAttributes?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class LocalCatalogResetOverrideDto {
  @IsUUID()
  localItemId!: string;
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
