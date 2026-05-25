import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { OrderType } from '../../enums/order-type.enum';
import { OrderPaymentMethod } from '../../enums/order-payment-method.enum';
import { CreateOrderNestedItemDto } from './create-order-nested-item.dto';
import { CreateOrderDeliveryDetailsDto } from './create-order-delivery-details.dto';

/** API Spec §5.1 POST /api/v1/orders */
export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  loyaltyRedeemPoints?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  giftCardCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  giftCardAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  storeCreditAmount?: number;

  @IsUUID()
  locationId!: string;

  @IsEnum(OrderType)
  orderType!: OrderType;

  @IsOptional()
  @IsEnum(OrderPaymentMethod)
  paymentMethod?: OrderPaymentMethod;

  @ValidateIf((dto: CreateOrderDto) => dto.orderType === OrderType.DELIVERY)
  @ValidateNested()
  @Type(() => CreateOrderDeliveryDetailsDto)
  deliveryDetails?: CreateOrderDeliveryDetailsDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderNestedItemDto)
  items!: CreateOrderNestedItemDto[];
}
