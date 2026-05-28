import { createServerApiClient } from '@/lib/api/server';
import { listHqOrders } from '@/lib/api/admin/franchise-hq';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { FranchiseOrdersTable } from '@/components/franchise-hq/franchise-hq-tables';
import { FRANCHISE_HQ_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

export default async function FranchiseHqOrdersPage() {
  let result: Awaited<ReturnType<typeof listHqOrders>> | null = null;
  let error: string | null = null;
  try {
    result = await listHqOrders(createServerApiClient(), { limit: 100 });
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader title="Franchise HQ Orders" description="Read-only order visibility across all franchisee locations."
        tabs={<SubNav variant="embedded" items={FRANCHISE_HQ_SUBNAV} />} />
      {error ? <ApiErrorBanner message={error} /> : null}
      {result?.rows.length ? (
        <FranchiseOrdersTable orders={result.rows} />
      ) : (
        <EmptyState title="No orders" description="Orders across franchise locations will appear here." />
      )}
    </>
  );
}
