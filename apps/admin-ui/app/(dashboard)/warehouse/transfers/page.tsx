import { PageHeader } from '@/components/ui/page-header';
import { StockTransfersPanel } from '@/components/warehouse/stock-transfers-panel';

export default function WarehouseTransfersPage() {
  return (
    <>
      <PageHeader
        title="Stock Transfers"
        description="Create, ship, receive, and track distribution transfers between locations."
      />
      <StockTransfersPanel />
    </>
  );
}
