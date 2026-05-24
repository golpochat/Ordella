import { OrderDetailView } from '@/components/order-detail-view';

type OrderPageProps = {
  params: { orderId: string };
};

export default function OrderDetailPage({ params }: OrderPageProps) {
  return <OrderDetailView orderId={params.orderId} />;
}
