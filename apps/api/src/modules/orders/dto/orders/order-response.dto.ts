import { OrderStatus } from '../../enums/order-status.enum';
import { OrderType } from '../../enums/order-type.enum';
import { OrderPaymentStatus } from '../../enums/order-payment-status.enum';
import { OrderPaymentMethod } from '../../enums/order-payment-method.enum';
import { OrderDeliveryDetails } from '../../types/order-delivery-details.types';
import { OrderItemResponseDto } from '../order-items/order-item-response.dto';

export class OrderResponseDto {
  id!: string;
  tenantId!: string;
  locationId!: string;
  customerId!: string | null;
  orderType!: OrderType;
  status!: OrderStatus;
  paymentStatus!: OrderPaymentStatus;
  paymentMethod!: OrderPaymentMethod | null;
  subtotal!: string;
  tax!: string;
  total!: string;
  orderNumber!: string | null;
  deliveryDetails!: OrderDeliveryDetails | null;
  items?: OrderItemResponseDto[];
  createdAt!: Date;
  updatedAt!: Date | null;
}
