import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { FulfillmentDisplayStatus } from '../enums/fulfillment-display-status.enum';

export class UpdateFulfillmentStatusDto {
  @IsUUID()
  orderId!: string;

  @IsEnum(FulfillmentDisplayStatus)
  status!: FulfillmentDisplayStatus;

  @IsOptional()
  @IsUUID()
  staffId?: string;
}
