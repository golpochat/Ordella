import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderPaymentMethod } from '../enums/order-payment-method.enum';

export interface OrderPaymentContext {
  tenant: TenantContext;
  order: OrderEntity;
  items: OrderItemEntity[];
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  paymentMethod?: OrderPaymentMethod | null;
  reason?: string;
}
