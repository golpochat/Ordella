import { BadRequestException, NotFoundException } from '@nestjs/common';

export function throwPosCartNotFound(cartId: string): never {
  throw new NotFoundException(`POS cart not found: ${cartId}`);
}

export function throwPosCartEmpty(cartId: string): never {
  throw new BadRequestException(`POS cart ${cartId} has no items`);
}

export function throwPosCartAlreadyCheckedOut(cartId: string): never {
  throw new BadRequestException(`POS cart ${cartId} was already checked out`);
}

export function throwPosCartTenantMismatch(cartId: string): never {
  throw new BadRequestException(`POS cart ${cartId} does not belong to this tenant`);
}

export function throwPosContextMismatch(): never {
  throw new BadRequestException('POS terminal, cashier, or shift does not match the cart session');
}

export function throwPosOrderNotFound(orderId: string): never {
  throw new NotFoundException(`POS order not found: ${orderId}`);
}

export function throwPosInvalidQuantity(): never {
  throw new BadRequestException('Quantity must be at least 1');
}

export function throwPosPaymentFailed(reason?: string): never {
  throw new BadRequestException(reason ?? 'POS payment failed');
}
