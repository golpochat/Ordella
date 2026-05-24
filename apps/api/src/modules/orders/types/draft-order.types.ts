import { OrderTotals } from '../domain/order-totals.util';

export interface CalculatedLineItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: string;
  lineSubtotal: string;
  notes: string | null;
}

export interface DraftOrderTotals extends OrderTotals {
  discountAmount: string;
  promotionIds: string[];
}
