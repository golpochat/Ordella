import { IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ProductStatus } from '../../enums/product-status.enum';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsObject()
  channelVisibility?: Record<string, boolean>;
}
