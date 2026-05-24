import { OrderType } from '../../../orders/enums/order-type.enum';
import { DeliveryTaskStatus } from '../../enums/delivery-task-status.enum';

export class DriverOrderLineDto {
  name!: string;
  quantity!: number;
}

export class DriverOrderResponseDto {
  id!: string;
  orderId!: string;
  orderNumber!: string | null;
  orderType!: OrderType;
  status!: DeliveryTaskStatus;
  driverId!: string | null;
  customerName!: string;
  customerPhone!: string;
  deliveryAddress!: string | null;
  itemsSummary!: DriverOrderLineDto[];
  notes!: string | null;
  createdAt!: string;
  eta!: string | null;
  metadata!: Record<string, unknown>;
  isPickup!: boolean;
}
