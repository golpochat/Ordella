import { CrmDashboardPanel } from '@/components/crm/crm-dashboard-panel';
import { SubNav } from '@/components/ui/sub-nav';
import { fetchCrmCustomers, fetchCrmInsights, fetchCrmSegments } from '@/lib/api/admin/crm';
import { createServerApiClient } from '@/lib/api/server';
import { CRM_SUBNAV } from '@/lib/navigation';

export default async function CrmPage() {
  const api = createServerApiClient();
  const [insights, customers, segments] = await Promise.all([
    fetchCrmInsights(api),
    fetchCrmCustomers(api),
    fetchCrmSegments(api),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">CRM</h1>
        <p className="text-sm text-muted-foreground">Customer insights, segments, tags, and order history for every retail sector.</p>
      </div>
      <SubNav items={CRM_SUBNAV} />
      <CrmDashboardPanel insights={insights} customers={customers} segments={segments} />
    </div>
  );
}
