import { Suspense } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { InventoryFilters } from '@/components/inventory/inventory-filters';
import { InventoryDashboard } from '@/components/inventory/inventory-dashboard';
import { AdjustmentModal } from '@/components/inventory/adjustment-modal';
import { INVENTORY_SUBNAV } from '@/lib/navigation';

type InventoryPageProps = {
  searchParams: { search?: string };
};

export default function InventoryPage({ searchParams: _searchParams }: InventoryPageProps) {
  return (
    <>
      <PageHeader
        title="Inventory"
        description="Per-location stock levels for all retail formats"
      />
      <div className="mb-4 flex justify-end">
        <AdjustmentModal />
      </div>
      <SubNav items={INVENTORY_SUBNAV} />
      <Suspense fallback={null}>
        <InventoryFilters />
      </Suspense>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading stock…</p>}>
        <InventoryDashboard />
      </Suspense>
    </>
  );
}
