import { OrderStatus } from '../../orders/enums/order-status.enum';
import { OrderPaymentStatus } from '../../orders/enums/order-payment-status.enum';
import { OrderType } from '../../orders/enums/order-type.enum';

export class OnlineOrderStatusResponseDto {
  orderId!: string;
  orderNumber!: string | null;
  status!: OrderStatus;
  paymentStatus!: OrderPaymentStatus;
  orderType!: OrderType;
  total!: string;
  createdAt!: string;
  updatedAt!: string | null;
  driverName?: string | null;
  driverStatus?: string | null;
  driverStatusLabel?: string | null;
  deliveryConfirmed?: boolean;
  fulfilledByLocationId?: string | null;
  fulfilledByLocationName?: string | null;
  routingReason?: string | null;
  estimatedDeliveryMinutes?: number | null;
}
