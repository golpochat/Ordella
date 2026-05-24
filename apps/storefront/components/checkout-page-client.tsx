'use client';

import { PaymentScreen } from '@/components/payment-screen';
import { CheckoutForm } from '@/components/checkout-form';

export function CheckoutPageClient({
  step,
  sessionId,
}: {
  step?: string;
  sessionId?: string;
}) {
  if (step === 'payment' && sessionId) {
    return <PaymentScreen sessionId={sessionId} />;
  }
  return <CheckoutForm />;
}
