import { OrderRoutingPanel } from '@/components/settings/order-routing-panel';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { FRANCHISE_HQ_SUBNAV } from '@/lib/navigation';

export default function FranchiseHqRoutingPage() {
  return (
    <>
      <PageHeader
        title="Order Routing"
        description="Review routing performance, zone coverage, and location priorities across the operation."
      />
      <SubNav items={FRANCHISE_HQ_SUBNAV} />
      <OrderRoutingPanel />
    </>
  );
}
