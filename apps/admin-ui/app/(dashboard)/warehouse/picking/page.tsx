import { PageHeader } from '@/components/ui/page-header';
import { PickingModePanel } from '@/components/warehouse/picking-mode-panel';

export default function WarehousePickingPage() {
  return (
    <>
      <PageHeader
        title="Picking Mode"
        description="Operational picking dashboard for dark stores, micro-fulfillment locations, waves, batches, and zones."
      />
      <PickingModePanel />
    </>
  );
}
