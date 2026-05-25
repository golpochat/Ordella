import { PageHeader } from '@/components/ui/page-header';
import { PurchaseOrdersPanel } from '@/components/procurement/purchase-orders-panel';

export default function PurchaseOrdersPage() {
  return (
    <>
      <PageHeader
        title="Purchase Orders"
        description="Create, send, receive, and track purchase orders across locations."
      />
      <PurchaseOrdersPanel />
    </>
  );
}
