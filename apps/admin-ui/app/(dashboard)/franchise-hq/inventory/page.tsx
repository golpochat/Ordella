import { createServerApiClient } from '@/lib/api/server';
import { listHqInventory } from '@/lib/api/admin/franchise-hq';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { FranchiseInventoryTable } from '@/components/franchise-hq/franchise-hq-tables';
import { FRANCHISE_HQ_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

export default async function FranchiseHqInventoryPage() {
  let items: Awaited<ReturnType<typeof listHqInventory>> = [];
  let error: string | null = null;
  try {
    items = await listHqInventory(createServerApiClient(), { limit: 100 });
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader title="Franchise HQ Inventory" description="Low-stock and out-of-stock issues across franchisee locations." />
      <SubNav items={FRANCHISE_HQ_SUBNAV} />
      {error ? <ApiErrorBanner message={error} /> : null}
      {items.length ? (
        <FranchiseInventoryTable items={items} />
      ) : (
        <EmptyState title="No inventory issues" description="Inventory alerts across the franchise group will appear here." />
      )}
    </>
  );
}
