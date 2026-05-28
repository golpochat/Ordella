import { Suspense } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { InventoryFilters } from '@/components/inventory/inventory-filters';
import { InventoryDashboard } from '@/components/inventory/inventory-dashboard';
import { AdjustmentModal } from '@/components/inventory/adjustment-modal';
import { INVENTORY_SUBNAV } from '@/lib/navigation';
import { TablePanelSkeleton } from '@/components/ui/admin-loader';

type InventoryPageProps = {
  searchParams: { search?: string };
};

export default function InventoryPage({ searchParams: _searchParams }: InventoryPageProps) {
  return (
    <>
      <PageHeader
        title="Inventory"
        description="Per-location stock levels for all retail formats"
        actions={<AdjustmentModal />}
        tabs={<SubNav variant="embedded" items={INVENTORY_SUBNAV} />}
      />
      <Suspense fallback={null}>
        <InventoryFilters />
      </Suspense>
      <Suspense fallback={<TablePanelSkeleton rows={6} columns={5} />}>
        <InventoryDashboard />
      </Suspense>
    </>
  );
}
