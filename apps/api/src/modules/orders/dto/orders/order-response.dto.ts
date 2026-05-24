import { OrderStatus } from '../../enums/order-status.enum';
import { OrderType } from '../../enums/order-type.enum';
import { OrderItemResponseDto } from '../order-items/order-item-response.dto';

export class OrderResponseDto {
  id!: string;
  tenantId!: string;
  locationId!: string;
  customerId!: string | null;
  orderType!: OrderType;
  status!: OrderStatus;
  subtotal!: string;
  tax!: string;
  total!: string;
  orderNumber!: string | null;
  items?: OrderItemResponseDto[];
  createdAt!: Date;
  updatedAt!: Date | null;
}
