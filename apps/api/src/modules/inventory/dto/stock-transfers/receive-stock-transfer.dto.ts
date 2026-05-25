import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';

export class ReceiveStockTransferLineDto {
  @IsUUID()
  transferLineId!: string;

  @IsNumber()
  @Min(0)
  quantityReceived!: number;
}

export class ReceiveStockTransferDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveStockTransferLineDto)
  lines!: ReceiveStockTransferLineDto[];
}
