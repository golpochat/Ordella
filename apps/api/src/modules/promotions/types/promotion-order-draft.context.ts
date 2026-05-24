/** Order draft context without importing the Orders module. */
export interface PromotionOrderLine {
  productId: string;
  quantity: number;
  lineSubtotal: string;
  categoryId?: string | null;
}

export interface PromotionOrderDraftContext {
  tenantId: string;
  orderId?: string | null;
  customerId?: string | null;
  couponCode?: string | null;
  subtotal: string;
  taxTotal: string;
  deliveryFee: string;
  serviceChargeTotal: string;
  lines: PromotionOrderLine[];
  /** Promotion IDs already applied in this draft (for stacking checks). */
  appliedPromotionIds?: string[];
  action?: 'apply' | 'void';
}

export interface AppliedPromotionResult {
  promotionId: string;
  code?: string | null;
  discountAmount: string;
}

export interface ApplyPromotionsResult {
  discountTotal: string;
  promotionIds: string[];
  appliedPromotions: AppliedPromotionResult[];
  grandTotal: string;
}
