import { PaymentProvider } from '../enums/payment-provider.enum';

export function resolvePaymentProvider(method: string): PaymentProvider {
  const normalized = method.toLowerCase();

  if (normalized === 'cash' || normalized === 'pos') {
    return PaymentProvider.CASH;
  }
  if (normalized === 'stripe' || normalized === 'card') {
    return PaymentProvider.STRIPE;
  }
  if (normalized === 'paypal') {
    return PaymentProvider.PAYPAL;
  }
  if (normalized === 'square') {
    return PaymentProvider.SQUARE;
  }
  if (normalized === 'terminal') {
    return PaymentProvider.TERMINAL;
  }

  return PaymentProvider.MANUAL;
}
