import { createServerApiClient } from '@/lib/api/server';
import { listCategories } from '@/lib/api/admin/products';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { CategoriesPanel } from '@/components/products/categories-panel';
import { PRODUCTS_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  let error: string | null = null;

  try {
    categories = await listCategories(createServerApiClient());
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader title="Categories" description="Organize your catalog"
        tabs={<SubNav variant="embedded" items={PRODUCTS_SUBNAV} />} />
      {error ? <ApiErrorBanner message={error} /> : null}
      <CategoriesPanel categories={categories} />
    </>
  );
}
