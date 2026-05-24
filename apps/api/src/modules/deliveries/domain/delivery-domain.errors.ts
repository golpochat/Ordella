import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeliveryTaskStatus } from '../enums/delivery-task-status.enum';

export function throwDeliveryTaskNotFound(taskId: string): never {
  throw new NotFoundException(`Delivery task ${taskId} not found`);
}

export function throwDeliveryTaskForOrderNotFound(orderId: string): never {
  throw new NotFoundException(`Delivery task for order ${orderId} not found`);
}

export function throwInactiveDriver(driverId: string): never {
  throw new BadRequestException(`Driver ${driverId} is inactive`);
}

export function throwInvalidDeliveryTransition(
  from: DeliveryTaskStatus,
  to: DeliveryTaskStatus,
): never {
  throw new BadRequestException(`Cannot transition delivery from "${from}" to "${to}"`);
}

export function throwAlreadyDelivered(taskId: string): never {
  throw new BadRequestException(`Delivery task ${taskId} already delivered`);
}
