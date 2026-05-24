import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OrderStatus } from '../../orders/enums/order-status.enum';

export class FilterKdsOrdersDto {
  @IsOptional()
  @IsUUID()
  station?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
