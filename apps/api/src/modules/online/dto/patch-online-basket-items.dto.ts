import { Type } from 'class-transformer';
import { IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { OnlineBasketItemDto } from './online-basket-item.dto';
import { OnlineBasketAction } from '../enums/online-basket-action.enum';

/** PATCH /public/basket/items */
export class PatchOnlineBasketItemsDto {
  @IsUUID()
  sessionId!: string;

  @IsEnum(OnlineBasketAction)
  action!: OnlineBasketAction;

  @ValidateNested()
  @Type(() => OnlineBasketItemDto)
  item!: OnlineBasketItemDto;
}
