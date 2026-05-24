import { PageHeader } from '@/components/ui/page-header';
import { CatalogBuilder } from '@/components/catalog/catalog-builder';

export default function CatalogPage() {
  return (
    <>
      <PageHeader
        title="Catalog"
        description="Manage categories, items, variants, and modifiers for your business"
      />
      <CatalogBuilder />
    </>
  );
}
