import { CrmCustomerProfilePanel } from '@/components/crm/crm-customer-profile-panel';
import { DetailPage, DetailPageHeader } from '@/components/ui/admin-detail';
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
    <DetailPage>
      <DetailPageHeader
        breadcrumb={[
          { label: 'CRM', href: '/crm' },
          { label: customer.name },
        ]}
        title={customer.name}
        description="CRM notes, tags, segments, loyalty, store credit, and order history."
        tabs={<SubNav variant="embedded" items={CRM_SUBNAV} />}
      />
      <CrmCustomerProfilePanel initialCustomer={customer} />
    </DetailPage>
  );
}
