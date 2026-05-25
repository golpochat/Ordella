import { Injectable } from '@nestjs/common';
import { OnlineOrderType } from '../enums/online-order-type.enum';

export interface StripeCheckoutPendingSnapshot {
  tenantId: string;
  locationId: string;
  orderType: OnlineOrderType;
  customer: { name: string; phone: string; email?: string };
  delivery?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode?: string;
    instructions?: string;
  };
  notes?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    modifierOptionIds?: string[];
  }>;
  grandTotal: string;
  currency: string;
  customerId?: string;
  loyaltyRedeemPoints?: number;
  giftCardCode?: string;
  giftCardAmount?: number;
  storeCreditAmount?: number;
  fulfilledOrderId?: string;
  stripeSessionId?: string;
}

@Injectable()
export class StripeCheckoutPendingStore {
  private readonly byRef = new Map<string, StripeCheckoutPendingSnapshot>();

  set(checkoutRef: string, snapshot: StripeCheckoutPendingSnapshot): void {
    this.byRef.set(checkoutRef, snapshot);
  }

  get(checkoutRef: string): StripeCheckoutPendingSnapshot | undefined {
    return this.byRef.get(checkoutRef);
  }

  markFulfilled(checkoutRef: string, orderId: string, stripeSessionId: string): void {
    const entry = this.byRef.get(checkoutRef);
    if (entry) {
      entry.fulfilledOrderId = orderId;
      entry.stripeSessionId = stripeSessionId;
    }
  }

  findByStripeSessionId(sessionId: string): { checkoutRef: string; snapshot: StripeCheckoutPendingSnapshot } | null {
    for (const [checkoutRef, snapshot] of this.byRef.entries()) {
      if (snapshot.stripeSessionId === sessionId || snapshot.fulfilledOrderId) {
        if (snapshot.stripeSessionId === sessionId) {
          return { checkoutRef, snapshot };
        }
      }
    }
    return null;
  }
}
