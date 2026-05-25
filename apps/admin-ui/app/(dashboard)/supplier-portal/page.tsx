import { PageHeader } from '@/components/ui/page-header';
import { SupplierPortalPanel } from '@/components/procurement/supplier-portal-panel';

export default function SupplierPortalPage() {
  return (
    <>
      <PageHeader
        title="Supplier Portal"
        description="Manage supplier portal access, confirmations, messages, and performance."
      />
      <SupplierPortalPanel />
    </>
  );
}
