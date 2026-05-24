import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateVariantDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsNumber()
  priceDelta?: number;

  @IsOptional()
  @IsString()
  sku?: string;
}
