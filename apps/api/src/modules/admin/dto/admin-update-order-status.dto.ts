import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../../orders/enums/order-status.enum';

export class AdminUpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @IsOptional()
  @IsBoolean()
  adminOverride?: boolean;
}
