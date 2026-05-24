import { IsUUID } from 'class-validator';

export class RouteToFulfillmentDto {
  @IsUUID()
  orderId!: string;
}
