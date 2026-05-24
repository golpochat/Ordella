import { OrderType } from '../../orders/enums/order-type.enum';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { OrderPaymentStatus } from '../../orders/enums/order-payment-status.enum';

export class PosReceiptLineDto {
  productId!: string;
  variantId!: string | null;
  quantity!: number;
  price!: string;
  notes!: string | null;
}

export class PosReceiptResponseDto {
  orderId!: string;
  orderNumber!: string | null;
  terminalId!: string;
  cashierId!: string;
  shiftId!: string;
  locationId!: string;
  orderType!: OrderType;
  status!: OrderStatus;
  paymentStatus!: OrderPaymentStatus;
  subtotal!: string;
  tax!: string;
  total!: string;
  items!: PosReceiptLineDto[];
  paidAt!: string | null;
  createdAt!: string;
}
