import { CheckoutPageClient } from '@/components/checkout-page-client';

type CheckoutPageProps = {
  searchParams: { step?: string; sessionId?: string };
};

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
  return <CheckoutPageClient step={searchParams.step} sessionId={searchParams.sessionId} />;
}
