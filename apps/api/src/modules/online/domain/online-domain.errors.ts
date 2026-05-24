import { BadRequestException, NotFoundException } from '@nestjs/common';

export function throwOnlineBasketNotFound(sessionId: string): never {
  throw new NotFoundException(`Online basket not found: ${sessionId}`);
}

export function throwOnlineBasketEmpty(sessionId: string): never {
  throw new BadRequestException(`Online basket ${sessionId} has no items`);
}

export function throwOnlineBasketTenantMismatch(sessionId: string): never {
  throw new BadRequestException(`Online basket ${sessionId} does not belong to this tenant`);
}

export function throwOnlineCheckoutRequired(sessionId: string): never {
  throw new BadRequestException(`Checkout must be completed before payment for session ${sessionId}`);
}

export function throwOnlineProductInactive(productId: string): never {
  throw new BadRequestException(`Product ${productId} is not available for online ordering`);
}

export function throwOnlineProductOutOfStock(productId: string): never {
  throw new BadRequestException(`Product ${productId} is out of stock`);
}

export function throwOnlineInsufficientStock(productId: string, requested: number, available: number): never {
  throw new BadRequestException(
    `Insufficient stock for product ${productId}: requested ${requested}, available ${available}`,
  );
}

export function throwOnlineDeliveryAddressRequired(): never {
  throw new BadRequestException('Delivery address is required for delivery orders');
}

export function throwOnlineOrderNotFound(orderId: string): never {
  throw new NotFoundException(`Online order not found: ${orderId}`);
}

export function throwOnlineCategoryNotFound(categoryId: string): never {
  throw new NotFoundException(`Menu category not found: ${categoryId}`);
}

export function throwOnlineInvalidQuantity(): never {
  throw new BadRequestException('Quantity must be at least 1');
}

export function throwOnlinePaymentFailed(reason?: string): never {
  throw new BadRequestException(reason ?? 'Online payment failed');
}
