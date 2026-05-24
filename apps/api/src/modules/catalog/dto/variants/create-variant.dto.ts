import { IsNumber, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

/** API Spec §3.2 POST /api/v1/variants */
export class CreateVariantDto {
  @IsUUID()
  productId!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsNumber()
  priceDelta?: number;

  @IsOptional()
  @IsString()
  sku?: string;
}
