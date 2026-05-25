import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderType } from '../../orders/enums/order-type.enum';
import { PosPaymentMethod } from '../enums/pos-payment-method.enum';
import { PosContextDto } from './pos-context.dto';

class PosCustomerDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;
}

/** POST /pos/complete-sale — checkout, payment, fulfillment, inventory in one step */
export class PosCompleteSaleDto extends PosContextDto {
  @IsUUID()
  cartId!: string;

  @IsEnum(OrderType)
  orderType!: OrderType;

  @IsEnum(PosPaymentMethod)
  paymentMethod!: PosPaymentMethod;

  @IsOptional()
  @ValidateNested()
  @Type(() => PosCustomerDto)
  customer?: PosCustomerDto;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  orderNotes?: string;

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

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountFixed?: number;
}
