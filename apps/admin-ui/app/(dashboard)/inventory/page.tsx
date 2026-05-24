import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { listStock } from '@/lib/api/admin/inventory';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { StockTable } from '@/components/inventory/stock-table';
import { AdjustmentModal } from '@/components/inventory/adjustment-modal';
import { InventoryFilters } from '@/components/inventory/inventory-filters';
import { INVENTORY_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

type InventoryPageProps = {
  searchParams: { search?: string };
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  let items: Awaited<ReturnType<typeof listStock>> = [];
  let error: string | null = null;

  try {
    items = await listStock(createServerApiClient(), { search: searchParams.search });
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Current stock levels by location"
        action={undefined}
      />
      <div className="mb-4 flex justify-end">
        <AdjustmentModal />
      </div>
      <SubNav items={INVENTORY_SUBNAV} />
      <Suspense fallback={null}>
        <InventoryFilters />
      </Suspense>
      {error ? <ApiErrorBanner message={error} /> : null}
      {items.length === 0 && !error ? (
        <EmptyState title="No stock records" description="Stock levels will appear here." />
      ) : (
        <StockTable items={items} />
      )}
    </>
  );
}
