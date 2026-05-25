import { PageHeader } from '@/components/ui/page-header';
import { SuppliersPanel } from '@/components/procurement/suppliers-panel';

export default function SuppliersPage() {
  return (
    <>
      <PageHeader
        title="Suppliers"
        description="Manage supplier contacts, supplied items, lead times, and cost pricing."
      />
      <SuppliersPanel />
    </>
  );
}
