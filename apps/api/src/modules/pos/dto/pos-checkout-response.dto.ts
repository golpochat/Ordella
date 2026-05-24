export class PosCheckoutResponseDto {
  cartId!: string;
  orderId!: string;
  orderNumber!: string | null;
  subtotal!: string;
  tax!: string;
  total!: string;
}
