import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { OrderType } from '../../enums/order-type.enum';
import { CreateOrderItemInputDto } from './create-order-item-input.dto';

/** API Spec §5.1 POST /api/v1/orders */
export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsUUID()
  locationId!: string;

  @IsEnum(OrderType)
  orderType!: OrderType;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemInputDto)
  items!: CreateOrderItemInputDto[];
}
