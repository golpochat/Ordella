import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { OnlineBasketItemDto } from './online-basket-item.dto';

/** POST /public/basket */
export class CreateOnlineBasketDto {
  @IsUUID()
  locationId!: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => OnlineBasketItemDto)
  item?: OnlineBasketItemDto;
}
