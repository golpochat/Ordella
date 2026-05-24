export class OnlinePaymentResponseDto {
  sessionId!: string;
  orderId!: string;
  orderNumber!: string | null;
  paymentId!: string;
  paymentIntentId!: string;
  paymentStatus!: string;
  orderStatus!: string;
  total!: string;
}
