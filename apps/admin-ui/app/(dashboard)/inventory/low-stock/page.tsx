import { Suspense } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { LowStockPanel } from '@/components/inventory/low-stock-panel';
import { INVENTORY_SUBNAV } from '@/lib/navigation';

export default function LowStockPage() {
  return (
    <>
      <PageHeader
        title="Low stock"
        description="Items at or below reorder point, or out of stock"
      />
      <SubNav items={INVENTORY_SUBNAV} />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <LowStockPanel />
      </Suspense>
    </>
  );
}
