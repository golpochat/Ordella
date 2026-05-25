import { PageHeader } from '@/components/ui/page-header';
import { WarehouseManagementPanel } from '@/components/warehouse/warehouse-management-panel';

export default function WarehousePage() {
  return (
    <>
      <PageHeader
        title="Warehouse Management"
        description="Manage warehouse zones, bins, stock visibility, and picking work."
      />
      <WarehouseManagementPanel />
    </>
  );
}
