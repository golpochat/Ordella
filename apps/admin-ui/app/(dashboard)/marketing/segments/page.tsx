import { CustomerSegmentsPanel } from '@/components/marketing/customer-segments-panel';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { listSegments } from '@/lib/api/admin/marketing';
import { createServerApiClient } from '@/lib/api/server';
import { MARKETING_SUBNAV } from '@/lib/navigation';

export default async function CustomerSegmentsPage() {
  const api = createServerApiClient();
  const segments = await listSegments(api);

  return (
    <>
      <PageHeader
        title="Customer Segments"
        description="Build reusable customer groups by order history, spend, loyalty, location, order type, and category."
        tabs={<SubNav variant="embedded" items={MARKETING_SUBNAV} />}
      />
      <CustomerSegmentsPanel initialSegments={segments} />
    </>
  );
}
