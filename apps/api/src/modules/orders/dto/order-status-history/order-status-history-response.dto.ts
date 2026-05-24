import { OrderStatus } from '../../enums/order-status.enum';

export class OrderStatusHistoryResponseDto {
  id!: string;
  orderId!: string;
  fromStatus!: OrderStatus | null;
  toStatus!: OrderStatus;
  changedBy!: string | null;
  reason!: string | null;
  createdAt!: Date;
}
