import { createServerApiClient } from '@/lib/api/server';
import {
  listGlobalCatalogCategories,
  listGlobalCatalogItems,
  listLocalBrandCatalog,
} from '@/lib/api/admin/brand-catalog';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { BrandCatalogPanel } from '@/components/franchise-hq/brand-catalog-panel';
import { FRANCHISE_HQ_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

export default async function FranchiseHqCatalogPage() {
  const api = createServerApiClient();
  let globalItems: Awaited<ReturnType<typeof listGlobalCatalogItems>> = [];
  let globalCategories: Awaited<ReturnType<typeof listGlobalCatalogCategories>> = [];
  let localItems: Awaited<ReturnType<typeof listLocalBrandCatalog>> = [];
  let error: string | null = null;

  try {
    [globalItems, globalCategories, localItems] = await Promise.all([
      listGlobalCatalogItems(api),
      listGlobalCatalogCategories(api),
      listLocalBrandCatalog(api),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Brand Catalog"
        description="Manage global catalog templates, inherited items, and tenant-level overrides across brand tenants."
      />
      <SubNav items={FRANCHISE_HQ_SUBNAV} />
      {error ? <ApiErrorBanner message={error} /> : null}
      <BrandCatalogPanel
        initialGlobalItems={globalItems}
        initialGlobalCategories={globalCategories}
        initialLocalItems={localItems}
      />
    </>
  );
}
