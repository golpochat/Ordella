import { IsArray, IsNumber, IsObject, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class SaveCustomerBasketDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsArray()
  items!: Array<Record<string, unknown>>;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;
}

export class UpdateCustomerSavedBasketDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsArray()
  items?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;
}

export class SaveCustomerItemDto {
  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  label?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
