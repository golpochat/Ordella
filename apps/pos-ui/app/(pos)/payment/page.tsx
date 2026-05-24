import { PaymentScreen } from '@/components/payment-screen';

type PaymentPageProps = {
  searchParams: { orderId?: string; method?: string };
};

export default function PaymentPage({ searchParams }: PaymentPageProps) {
  const method =
    searchParams.method === 'card' || searchParams.method === 'pos' ? searchParams.method : 'cash';
  return <PaymentScreen orderId={searchParams.orderId} method={method} />;
}
