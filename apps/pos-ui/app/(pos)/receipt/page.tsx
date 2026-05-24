import { ReceiptScreen } from '@/components/receipt-screen';

type ReceiptPageProps = {
  searchParams: { orderId?: string };
};

export default function ReceiptPage({ searchParams }: ReceiptPageProps) {
  return <ReceiptScreen orderId={searchParams.orderId} />;
}
