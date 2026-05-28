import { SubNav } from '@/components/ui/sub-nav';
import { SupplierPortalPanel } from '@/components/procurement/supplier-portal-panel';
import { FRANCHISE_HQ_SUBNAV } from '@/lib/navigation';
import { PageHeader, PageSection, Stack } from '@shared-ui';

export default function HqSupplierPerformancePage() {
  return (
    <Stack gap="lg">
      <PageHeader
        title="HQ Supplier Performance"
        description="Review supplier confirmations, portal messages, delays, cost changes, and fill rate across locations."
        tabs={<SubNav variant="embedded" items={FRANCHISE_HQ_SUBNAV} />}
      />
      <PageSection title="Performance overview">
        <SupplierPortalPanel />
      </PageSection>
    </Stack>
  );
}
