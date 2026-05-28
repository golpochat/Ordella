import { CrmDashboardPanelLazy as CrmDashboardPanel } from '@/lib/lazy-panels';
import { CrmPageHeader } from '@/components/crm/crm-page-header';
import { fetchCrmCustomers, fetchCrmInsights, fetchCrmSegments } from '@/lib/api/admin/crm';
import { createServerApiClient } from '@/lib/api/server';

export default async function CrmPage() {
  const api = createServerApiClient();
  const [insights, customers, segments] = await Promise.all([
    fetchCrmInsights(api),
    fetchCrmCustomers(api),
    fetchCrmSegments(api),
  ]);

  return (
    <>
      <CrmPageHeader />
      <CrmDashboardPanel insights={insights} customers={customers} segments={segments} />
    </>
  );
}
