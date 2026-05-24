import { IsNumber, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

/** API Spec §4.1 POST /api/v1/stock-items */
export class CreateStockItemDto {
  @IsUUID()
  locationId!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  sku!: string;

  @IsString()
  @MinLength(1)
  unit!: string;

  @IsOptional()
  @IsNumber()
  quantityOnHand?: number;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsNumber()
  reorderLevel?: number;
}
