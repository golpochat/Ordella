import { IsOptional, IsUUID } from 'class-validator';
import { PosContextDto } from './pos-context.dto';

/** POST /pos/checkout */
export class PosCheckoutDto extends PosContextDto {
  @IsUUID()
  cartId!: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;
}
