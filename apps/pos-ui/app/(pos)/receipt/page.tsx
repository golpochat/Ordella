import { ReceiptScreen } from '@/components/receipt-screen';

type ReceiptPageProps = {
  searchParams: { orderId?: string; offline?: string };
};

export default function ReceiptPage({ searchParams }: ReceiptPageProps) {
  return <ReceiptScreen orderId={searchParams.orderId} offline={searchParams.offline === '1'} />;
}
