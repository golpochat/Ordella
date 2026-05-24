import { DEFAULT_ORDER_TAX_RATE } from '../../orders/constants/order-tax.constants';
import { OrderType } from '../../orders/enums/order-type.enum';
import {
  calculateGrandTotalAmount,
  formatMoney,
  parseMoney,
  sumMoney,
} from '../../orders/domain/order-totals.util';

export interface OnlineLinePricing {
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: string;
  modifierTotal: string;
  lineSubtotal: string;
  categoryId: string | null;
}

export interface OnlineTotalsInput {
  lines: OnlineLinePricing[];
  orderType: OrderType;
  discountTotal?: string;
}

export interface OnlineTotalsResult {
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  serviceChargeTotal: string;
  deliveryFee: string;
  grandTotal: string;
}

export function calculateOnlineTotals(input: OnlineTotalsInput): OnlineTotalsResult {
  const subtotal = formatMoney(sumMoney(input.lines.map((line) => line.lineSubtotal)));
  const discountTotal = input.discountTotal ?? '0.00';
  const taxableSubtotal = Math.max(0, parseMoney(subtotal) - parseMoney(discountTotal));
  const taxTotal = formatMoney(taxableSubtotal * DEFAULT_ORDER_TAX_RATE);
  const serviceChargeTotal = formatMoney(0);
  const deliveryFee =
    input.orderType === OrderType.DELIVERY ? formatMoney(3.99) : formatMoney(0);
  const grandTotal = formatMoney(
    calculateGrandTotalAmount({
      subtotal: parseMoney(subtotal),
      discountTotal: parseMoney(discountTotal),
      taxTotal: parseMoney(taxTotal),
      serviceChargeTotal: parseMoney(serviceChargeTotal),
      deliveryFee: parseMoney(deliveryFee),
    }),
  );

  return {
    subtotal,
    discountTotal,
    taxTotal,
    serviceChargeTotal,
    deliveryFee,
    grandTotal,
  };
}

export function isOnlineChannelVisible(channelVisibility: Record<string, boolean>): boolean {
  if (!channelVisibility || Object.keys(channelVisibility).length === 0) {
    return true;
  }
  return channelVisibility.online !== false;
}
