import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import {
  throwInvalidLineQuantity,
  throwOrderMissingItems,
  throwOrderNotFound,
} from './order-domain.errors';

export function assertValidLineQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throwInvalidLineQuantity(quantity);
  }
}

export function assertOrderHasItems(items: OrderItemEntity[]): void {
  if (!items.length) {
    throwOrderMissingItems();
  }
}

export function assertOrderTenantScope(order: OrderEntity, tenantId: string): void {
  if (order.tenantId !== tenantId) {
    throwOrderNotFound(order.id);
  }
}
