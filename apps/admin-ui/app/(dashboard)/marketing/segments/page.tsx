import { CustomerSegmentsPanel } from '@/components/marketing/customer-segments-panel';
import { SubNav } from '@/components/ui/sub-nav';
import { listSegments } from '@/lib/api/admin/marketing';
import { createServerApiClient } from '@/lib/api/server';
import { MARKETING_SUBNAV } from '@/lib/navigation';

export default async function CustomerSegmentsPage() {
  const segments = await listSegments(createServerApiClient());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Customer Segments</h1>
        <p className="text-sm text-muted-foreground">Build reusable customer groups by order history, spend, loyalty, location, order type, and category.</p>
      </div>
      <SubNav items={MARKETING_SUBNAV} />
      <CustomerSegmentsPanel initialSegments={segments} />
    </div>
  );
}
