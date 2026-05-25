import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { SupplierPortalPanel } from '@/components/procurement/supplier-portal-panel';
import { FRANCHISE_HQ_SUBNAV } from '@/lib/navigation';

export default function HqSupplierPerformancePage() {
  return (
    <>
      <PageHeader
        title="HQ Supplier Performance"
        description="Review supplier confirmations, portal messages, delays, cost changes, and fill rate across locations."
      />
      <SubNav items={FRANCHISE_HQ_SUBNAV} />
      <SupplierPortalPanel />
    </>
  );
}
