import { IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ProductStatus } from '../../enums/product-status.enum';

/** API Spec §3.1 POST /api/v1/products */
export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsObject()
  channelVisibility?: Record<string, boolean>;
}
