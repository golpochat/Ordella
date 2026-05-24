import { OrderTracking } from '@/components/order-tracking';

type OrderPageProps = {
  params: { orderId: string };
};

export default function OrderPage({ params }: OrderPageProps) {
  return <OrderTracking orderId={params.orderId} />;
}
