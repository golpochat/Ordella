/** Selected modifier option with resolved price for a line item. */
export interface LineItemModifierSelection {
  modifierOptionId: string;
  name: string;
  priceDelta: string;
}

/** Priced order line before order-level fees and promotions. */
export interface CalculatedLineItem {
  productId: string;
  variantId: string | null;
  bundleId?: string | null;
  quantity: number;
  /** Base catalog unit price (product + variant delta). */
  unitPrice: string;
  /** Sum of modifier price deltas per unit. */
  modifierTotal: string;
  /** unitPrice + modifierTotal */
  unitPriceWithModifiers: string;
  lineSubtotal: string;
  /** Placeholder until line-level tax rules exist. */
  lineTax: string;
  /** Placeholder until line-level discounts exist. */
  lineDiscount: string;
  notes: string | null;
  modifiers: LineItemModifierSelection[];
}

export interface AppliedPromotion {
  promotionId: string;
  code?: string;
  discountAmount: string;
}

/** Full priced draft for an order (API + persistence mapping). */
export interface DraftOrderTotals {
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  serviceChargeTotal: string;
  deliveryFee: string;
  grandTotal: string;
  promotionIds: string[];
  appliedPromotions: AppliedPromotion[];
}

/** Maps draft totals to `orders` table columns (subtotal, tax, total). */
export function mapDraftTotalsToOrderColumns(draft: DraftOrderTotals): {
  subtotal: string;
  tax: string;
  total: string;
} {
  return {
    subtotal: draft.subtotal,
    tax: draft.taxTotal,
    total: draft.grandTotal,
  };
}
