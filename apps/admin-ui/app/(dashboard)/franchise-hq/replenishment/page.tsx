import { ReplenishmentDashboardPanel } from '@/components/replenishment/replenishment-dashboard-panel';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { FRANCHISE_HQ_SUBNAV } from '@/lib/navigation';

export default function FranchiseHqReplenishmentPage() {
  return (
    <>
      <PageHeader
        title="HQ Replenishment"
        description="Review consolidated replenishment rules, auto-generated actions, and transfer or purchase recommendations."
      />
      <SubNav items={FRANCHISE_HQ_SUBNAV} />
      <ReplenishmentDashboardPanel />
    </>
  );
}
