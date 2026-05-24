import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '../enums/order-status.enum';

export function throwOrderNotFound(orderId: string): never {
  throw new NotFoundException(`Order ${orderId} not found`);
}

export function throwOrderItemNotFound(itemId: string): never {
  throw new NotFoundException(`Order item ${itemId} not found`);
}

export function throwInvalidOrderStatusTransition(
  from: OrderStatus,
  to: OrderStatus,
): never {
  throw new BadRequestException(
    `Cannot transition order from "${from}" to "${to}"`,
  );
}

export function throwOrderInTerminalStatus(status: OrderStatus): never {
  throw new BadRequestException(`Order is in terminal status "${status}"`);
}

export function throwOrderMissingItems(): never {
  throw new BadRequestException('Order must contain at least one item');
}

export function throwInvalidLineQuantity(quantity: number): never {
  throw new BadRequestException(
    `Invalid quantity "${quantity}": must be a positive integer`,
  );
}

export function throwOrderNotEditable(status: OrderStatus): never {
  throw new BadRequestException(
    `Order items can only be modified while status is "${OrderStatus.PENDING}" (current: "${status}")`,
  );
}
