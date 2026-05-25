import { PageHeader } from '@/components/ui/page-header';
import { BundlesPanel } from '@/components/catalog/bundles-panel';

export default function CatalogBundlesPage() {
  return (
    <>
      <PageHeader
        title="Bundles & Combos"
        description="Create flexible item bundles for storefront, POS, and promotions."
      />
      <BundlesPanel />
    </>
  );
}
