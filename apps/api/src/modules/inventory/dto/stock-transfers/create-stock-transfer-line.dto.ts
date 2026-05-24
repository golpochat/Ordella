import { IsNumber, IsUUID } from 'class-validator';

export class CreateStockTransferLineDto {
  @IsUUID()
  stockItemId!: string;

  @IsNumber()
  quantity!: number;
}
