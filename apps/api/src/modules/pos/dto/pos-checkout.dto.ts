import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
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
  @IsEnum(OrderType)
  orderType?: OrderType;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  orderNotes?: string;
}
