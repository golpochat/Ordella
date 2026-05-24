import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateOrderNestedItemDto {
  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
