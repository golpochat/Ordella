import { BadRequestException, NotFoundException } from '@nestjs/common';

export function throwKdsOrderNotFound(orderId: string): never {
  throw new NotFoundException(`Fulfillment display order not found: ${orderId}`);
}

export function throwKdsLineItemNotFound(orderId: string, lineItemId: string): never {
  throw new NotFoundException(
    `Fulfillment display line item not found: order=${orderId} item=${lineItemId}`,
  );
}

export function throwKdsInvalidLineTransition(from: string, to: string): never {
  throw new BadRequestException(`Invalid fulfillment line transition: ${from} → ${to}`);
}

export function throwKdsItemsNotAllCompleted(): never {
  throw new BadRequestException('All line items must be completed before marking the order ready');
}

export function throwKdsOrderNotPreparing(status: string): never {
  throw new BadRequestException(`Order must be in fulfillment (preparing) status, current: ${status}`);
}

export function throwKdsInvalidOrderTransition(from: string, to: string): never {
  throw new BadRequestException(`Invalid order status transition for fulfillment display: ${from} → ${to}`);
}

export function throwKdsOrderNotReadyForCompletion(status: string): never {
  throw new BadRequestException(`Order must be ready before completion, current: ${status}`);
}
