import { PaymentOrderContext } from '../../payments/types/payment-order.context';
import { TaxBreakdownLine } from '../../tax';
import { OnlineCustomerDetails, OnlineDeliveryDetails } from './online-basket.types';

export interface OnlineCheckoutSnapshot {
  orderType: string;
  customer: OnlineCustomerDetails;
  delivery?: OnlineDeliveryDetails;
  totals: {
    subtotal: string;
    discountTotal: string;
    taxTotal: string;
    serviceChargeTotal: string;
    deliveryFee: string;
    grandTotal: string;
    taxLines?: TaxBreakdownLine[];
  };
  appliedPromotions: Array<{ promotionId: string; code?: string | null; discountAmount: string }>;
  paymentContext: PaymentOrderContext;
}

export interface OnlineCheckoutResult {
  sessionId: string;
  orderType: string;
  customer: OnlineCustomerDetails;
  delivery?: OnlineDeliveryDetails;
  totals: OnlineCheckoutSnapshot['totals'];
  appliedPromotions: OnlineCheckoutSnapshot['appliedPromotions'];
  paymentContext: PaymentOrderContext;
}
