import { Type } from 'class-transformer';
import { IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { PosContextDto } from './pos-context.dto';
import { PosCartItemDto } from './pos-cart-item.dto';
import { PosCartAction } from '../enums/pos-cart-action.enum';

/** PATCH /pos/cart/items */
export class PatchPosCartItemsDto extends PosContextDto {
  @IsUUID()
  cartId!: string;

  @IsEnum(PosCartAction)
  action!: PosCartAction;

  @ValidateNested()
  @Type(() => PosCartItemDto)
  item!: PosCartItemDto;
}
