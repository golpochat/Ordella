export class PosCheckoutResponseDto {
  cartId!: string;
  orderId!: string;
  orderNumber!: string | null;
  subtotal!: string;
  discountTotal!: string;
  tax!: string;
  total!: string;
  appliedPromotions!: Array<{ promotionId: string; code?: string | null; discountAmount: string }>;
}
