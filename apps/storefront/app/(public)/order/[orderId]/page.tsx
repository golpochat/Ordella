import { OrderConfirmation } from '@/components/order-confirmation';
import { OrderTracking } from '@/components/order-tracking';

type OrderPageProps = {
  params: { orderId: string };
  searchParams: { confirmed?: string };
};

export default function OrderPage({ params, searchParams }: OrderPageProps) {
  if (searchParams.confirmed === '1') {
    return <OrderConfirmation orderId={params.orderId} justPlaced />;
  }
  return <OrderTracking orderId={params.orderId} />;
}
