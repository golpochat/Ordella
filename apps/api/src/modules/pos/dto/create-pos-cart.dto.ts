import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { PosContextDto } from './pos-context.dto';
import { PosCartItemDto } from './pos-cart-item.dto';

/** POST /pos/cart — create cart and optionally add first line */
export class CreatePosCartDto extends PosContextDto {
  @IsUUID()
  locationId!: string;

  @IsOptional()
  @IsUUID()
  cartId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PosCartItemDto)
  item?: PosCartItemDto;
}
