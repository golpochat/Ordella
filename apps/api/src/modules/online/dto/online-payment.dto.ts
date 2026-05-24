import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OrderPaymentMethod } from '../../orders/enums/order-payment-method.enum';

/** POST /public/payment */
export class OnlinePaymentDto {
  @IsUUID()
  sessionId!: string;

  @IsEnum(OrderPaymentMethod)
  method!: OrderPaymentMethod;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
