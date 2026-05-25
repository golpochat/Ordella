import { PageHeader } from '@/components/ui/page-header';
import { ReplenishmentDashboardPanel } from '@/components/replenishment/replenishment-dashboard-panel';

export default function ReplenishmentPage() {
  return (
    <>
      <PageHeader
        title="Replenishment"
        description="Automate safe purchase orders, transfers, and stockout alerts from rules and forecasts."
      />
      <ReplenishmentDashboardPanel />
    </>
  );
}
