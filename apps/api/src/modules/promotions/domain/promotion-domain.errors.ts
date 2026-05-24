import { BadRequestException, NotFoundException } from '@nestjs/common';

export function throwPromotionNotFound(id: string): never {
  throw new NotFoundException(`Promotion ${id} not found`);
}

export function throwCouponNotFound(code: string): never {
  throw new NotFoundException(`Coupon code "${code}" not found`);
}

export function throwInactivePromotion(codeOrId: string): never {
  throw new BadRequestException(`Promotion "${codeOrId}" is inactive`);
}

export function throwExpiredPromotion(codeOrId: string): never {
  throw new BadRequestException(`Promotion "${codeOrId}" has expired`);
}

export function throwPromotionNotYetActive(codeOrId: string): never {
  throw new BadRequestException(`Promotion "${codeOrId}" is not yet active`);
}

export function throwPromotionOutsideTimeWindow(codeOrId: string): never {
  throw new BadRequestException(`Promotion "${codeOrId}" is outside its time window`);
}

export function throwCouponAlreadyApplied(orderId: string, code: string): never {
  throw new BadRequestException(`Coupon "${code}" already applied to order ${orderId}`);
}

export function throwIncompatiblePromotionStacking(): never {
  throw new BadRequestException('Cannot stack incompatible promotions');
}

export function throwPromotionRulesNotMet(promotionId: string): never {
  throw new BadRequestException(`Promotion ${promotionId} eligibility rules not met`);
}
