import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { listMovements } from '@/lib/api/admin/inventory';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { MovementsTable } from '@/components/inventory/movements-table';
import { AdjustmentModal } from '@/components/inventory/adjustment-modal';
import { InventoryFilters } from '@/components/inventory/inventory-filters';
import { INVENTORY_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

type MovementsPageProps = {
  searchParams: { from?: string; to?: string };
};

export default async function MovementsPage({ searchParams }: MovementsPageProps) {
  let movements: Awaited<ReturnType<typeof listMovements>> = [];
  let error: string | null = null;

  try {
    movements = await listMovements(createServerApiClient(), {
      from: searchParams.from,
      to: searchParams.to,
    });
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader title="Stock movements" description="Ledger of inventory changes" />
      <div className="mb-4 flex justify-end">
        <AdjustmentModal />
      </div>
      <SubNav items={INVENTORY_SUBNAV} />
      <Suspense fallback={null}>
        <InventoryFilters />
      </Suspense>
      {error ? <ApiErrorBanner message={error} /> : null}
      {movements.length === 0 && !error ? (
        <EmptyState title="No movements" description="Adjustments and sales deductions appear here." />
      ) : (
        <MovementsTable movements={movements} />
      )}
    </>
  );
}
