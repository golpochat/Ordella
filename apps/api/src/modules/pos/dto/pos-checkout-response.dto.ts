export class PosCheckoutResponseDto {
  cartId!: string;
  orderId!: string;
  orderNumber!: string | null;
  subtotal!: string;
  discountTotal!: string;
  tax!: string;
  taxLines?: Array<{
    taxName: string;
    taxType: string;
    priceMode: string;
    taxRate: string;
    taxableAmount: string;
    taxAmount: string;
    jurisdiction: string;
  }>;
  total!: string;
  appliedPromotions!: Array<{ promotionId: string; code?: string | null; discountAmount: string }>;
}
