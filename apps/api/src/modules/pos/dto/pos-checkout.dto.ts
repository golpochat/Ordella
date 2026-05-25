import { IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { OrderType } from '../../orders/enums/order-type.enum';
import { PosContextDto } from './pos-context.dto';

/** POST /pos/checkout */
export class PosCheckoutDto extends PosContextDto {
  @IsUUID()
  cartId!: string;

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

  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  orderNotes?: string;
}
