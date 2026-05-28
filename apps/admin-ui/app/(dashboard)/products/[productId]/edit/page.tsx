import { notFound } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server';
import { listCategories, listProducts } from '@/lib/api/admin/products';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { ProductForm } from '@/components/products/product-form';
import { PRODUCTS_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';

type EditProductPageProps = {
  params: { productId: string };
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  let error: string | null = null;

  try {
    const api = createServerApiClient();
    const [products, cats] = await Promise.all([
      listProducts(api),
      listCategories(api),
    ]);
    categories = cats;
    const product = products.find((p) => p.id === params.productId);
    if (!product) notFound();

    return (
      <>
        <PageHeader title="Edit product" description={product.name}
        tabs={<SubNav variant="embedded" items={PRODUCTS_SUBNAV} />} />
        <ProductForm categories={categories} product={product} />
      </>
    );
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader title="Edit product"
        tabs={<SubNav variant="embedded" items={PRODUCTS_SUBNAV} />} />
      {error ? <ApiErrorBanner message={error} /> : null}
    </>
  );
}
