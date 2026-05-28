import { Suspense } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { LowStockPanelLazy as LowStockPanel } from '@/lib/lazy-panels';
import { INVENTORY_SUBNAV } from '@/lib/navigation';
import { TablePanelSkeleton } from '@/components/ui/admin-loader';

export default function LowStockPage() {
  return (
    <>
      <PageHeader
        title="Low stock"
        description="Items at or below reorder point, or out of stock"
        tabs={<SubNav variant="embedded" items={INVENTORY_SUBNAV} />}
      />
      <Suspense fallback={<TablePanelSkeleton rows={5} columns={4} />}>
        <LowStockPanel />
      </Suspense>
    </>
  );
}
