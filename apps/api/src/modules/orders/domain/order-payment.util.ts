import { OrderPaymentMethod } from '../enums/order-payment-method.enum';

const IMMEDIATE_PAYMENT_METHODS: ReadonlySet<OrderPaymentMethod> = new Set([
  OrderPaymentMethod.CASH,
  OrderPaymentMethod.POS,
]);

export function isImmediatePaymentMethod(
  method?: OrderPaymentMethod | null,
): boolean {
  return method != null && IMMEDIATE_PAYMENT_METHODS.has(method);
}
