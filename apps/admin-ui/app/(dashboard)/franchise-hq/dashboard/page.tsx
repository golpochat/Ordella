import { createServerApiClient } from '@/lib/api/server';
import { getHqOverview, listHqCategories, listHqCustomers } from '@/lib/api/admin/franchise-hq';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { FranchiseHqDashboardPanel } from '@/components/franchise-hq/franchise-hq-dashboard-panel';
import { FRANCHISE_HQ_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

export default async function FranchiseHqDashboardPage() {
  const api = createServerApiClient();
  let data: Awaited<ReturnType<typeof getHqOverview>> | null = null;
  let categories: Awaited<ReturnType<typeof listHqCategories>> = [];
  let customers: Awaited<ReturnType<typeof listHqCustomers>> = [];
  let error: string | null = null;

  try {
    [data, categories, customers] = await Promise.all([
      getHqOverview(api),
      listHqCategories(api),
      listHqCustomers(api),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Franchise HQ"
        description="Enterprise overview across franchisee tenants, locations, orders, inventory, staff, and alerts."
      />
      <SubNav items={FRANCHISE_HQ_SUBNAV} />
      {error ? <ApiErrorBanner message={error} /> : null}
      {data ? (
        <FranchiseHqDashboardPanel overview={data} categories={categories} customers={customers} />
      ) : (
        <EmptyState title="No HQ data" description="HQ analytics will appear once locations and franchisees start trading." />
      )}
    </>
  );
}
