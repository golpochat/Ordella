import { createServerApiClient } from '@/lib/api/server';
import { listProducts } from '@/lib/api/admin/products';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { ProductsTable } from '@/components/products/products-table';
import { PRODUCTS_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

export default async function ProductsPage() {
  let products: Awaited<ReturnType<typeof listProducts>> = [];
  let error: string | null = null;

  try {
    products = await listProducts(createServerApiClient());
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage catalog items and pricing"
        action={{ label: 'New product', href: '/products/new' }}
        tabs={<SubNav variant="embedded" items={PRODUCTS_SUBNAV} />}
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {!error ? <ProductsTable products={products} /> : null}
    </>
  );
}
