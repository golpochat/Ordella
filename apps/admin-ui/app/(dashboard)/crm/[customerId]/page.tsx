import { CrmCustomerProfilePanel } from '@/components/crm/crm-customer-profile-panel';
import { SubNav } from '@/components/ui/sub-nav';
import { fetchCrmCustomer } from '@/lib/api/admin/crm';
import { createServerApiClient } from '@/lib/api/server';
import { CRM_SUBNAV } from '@/lib/navigation';

type Props = {
  params: { customerId: string };
};

export default async function CrmCustomerPage({ params }: Props) {
  const customer = await fetchCrmCustomer(createServerApiClient(), params.customerId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Customer Profile</h1>
        <p className="text-sm text-muted-foreground">CRM notes, tags, segments, loyalty, store credit, and order history.</p>
      </div>
      <SubNav items={CRM_SUBNAV} />
      <CrmCustomerProfilePanel initialCustomer={customer} />
    </div>
  );
}
