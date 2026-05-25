import { PageHeader } from '@/components/ui/page-header';
import { MultiStoreInventoryPanel } from '@/components/inventory/multi-store-inventory-panel';

export default function MultiStoreInventoryPage() {
  return (
    <>
      <PageHeader
        title="Multi-Store Inventory"
        description="Sync and monitor stock across stores, warehouses, dark stores, and distribution centers."
      />
      <MultiStoreInventoryPanel />
    </>
  );
}
