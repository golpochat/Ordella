import { OnlineCheckoutResult } from '../types';

export class OnlineCheckoutResponseDto implements OnlineCheckoutResult {
  sessionId!: string;
  orderType!: string;
  customer!: OnlineCheckoutResult['customer'];
  delivery?: OnlineCheckoutResult['delivery'];
  totals!: OnlineCheckoutResult['totals'];
  appliedPromotions!: OnlineCheckoutResult['appliedPromotions'];
  paymentContext!: OnlineCheckoutResult['paymentContext'];
}
