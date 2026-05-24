import { createServerApiClient } from '@/lib/api/server';
import { listCategories } from '@/lib/api/admin/products';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { ProductForm } from '@/components/products/product-form';
import { PRODUCTS_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';

export default async function NewProductPage() {
  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  let error: string | null = null;

  try {
    categories = await listCategories(createServerApiClient());
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader title="New product" description="Add a menu item" />
      <SubNav items={PRODUCTS_SUBNAV} />
      {error ? <ApiErrorBanner message={error} /> : null}
      <ProductForm categories={categories} />
    </>
  );
}
