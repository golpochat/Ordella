import { createServerApiClient } from '@/lib/api/server';
import { listModifiers } from '@/lib/api/admin/products';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { ModifiersPanel } from '@/components/products/modifiers-panel';
import { PRODUCTS_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';

export default async function ModifiersPage() {
  let modifiers: Awaited<ReturnType<typeof listModifiers>> = [];
  let error: string | null = null;

  try {
    modifiers = await listModifiers(createServerApiClient());
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader title="Modifiers" description="Modifier groups and options" />
      <SubNav items={PRODUCTS_SUBNAV} />
      {error ? <ApiErrorBanner message={error} /> : null}
      <ModifiersPanel modifiers={modifiers} />
    </>
  );
}
