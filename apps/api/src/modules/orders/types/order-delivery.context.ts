import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';

export interface OrderDeliveryContext {
  tenant: TenantContext;
  order: OrderEntity;
  items: OrderItemEntity[];
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
}
