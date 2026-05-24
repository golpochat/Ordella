import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID, ValidateIf, ValidateNested } from 'class-validator';
import { OnlineOrderType } from '../enums/online-order-type.enum';
import { OnlineCustomerDto } from './online-customer.dto';
import { OnlineDeliveryDto } from './online-delivery.dto';

/** POST /public/checkout */
export class OnlineCheckoutDto {
  @IsUUID()
  sessionId!: string;

  @IsEnum(OnlineOrderType)
  orderType!: OnlineOrderType;

  @ValidateNested()
  @Type(() => OnlineCustomerDto)
  customer!: OnlineCustomerDto;

  @ValidateIf((dto: OnlineCheckoutDto) => dto.orderType === OnlineOrderType.DELIVERY)
  @ValidateNested()
  @Type(() => OnlineDeliveryDto)
  delivery?: OnlineDeliveryDto;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
