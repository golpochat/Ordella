import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

/** API Spec §5.2 POST /api/v1/order-items */
export class CreateOrderItemDto {
  @IsUUID()
  orderId!: string;

  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  modifierOptionIds?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
