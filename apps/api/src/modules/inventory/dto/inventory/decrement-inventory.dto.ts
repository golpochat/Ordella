import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';

class DecrementInventoryLineDto {
  @IsUUID()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class DecrementInventoryDto {
  @IsUUID()
  locationId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DecrementInventoryLineDto)
  lines!: DecrementInventoryLineDto[];
}
