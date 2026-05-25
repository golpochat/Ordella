import { createServerApiClient } from '@/lib/api/server';
import { listHqStaff } from '@/lib/api/admin/franchise-hq';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { FranchiseStaffTable } from '@/components/franchise-hq/franchise-hq-tables';
import { FRANCHISE_HQ_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

export default async function FranchiseHqStaffPage() {
  let result: Awaited<ReturnType<typeof listHqStaff>> | null = null;
  let error: string | null = null;
  try {
    result = await listHqStaff(createServerApiClient(), { limit: 100 });
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader title="Franchise HQ Staff" description="Read-only staff visibility across franchisee tenants." />
      <SubNav items={FRANCHISE_HQ_SUBNAV} />
      {error ? <ApiErrorBanner message={error} /> : null}
      {result?.rows.length ? (
        <FranchiseStaffTable staff={result.rows} />
      ) : (
        <EmptyState title="No staff" description="Staff records across franchisees will appear here." />
      )}
    </>
  );
}
