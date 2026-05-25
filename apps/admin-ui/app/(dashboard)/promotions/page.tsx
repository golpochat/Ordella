import { createServerApiClient } from '@/lib/api/server';
import { listPromotions } from '@/lib/api/admin/promotions';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PromotionsTable } from '@/components/promotions/promotions-table';
import { getErrorMessage } from '@/lib/utils';

export default async function PromotionsPage() {
  let promotions: Awaited<ReturnType<typeof listPromotions>> = [];
  let error: string | null = null;

  try {
    promotions = await listPromotions(createServerApiClient());
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Promotions & Discounts"
        description="Build automatic discounts, coupon codes, BXGY offers, thresholds, and channel-specific rules."
        action={{ label: 'New promotion', href: '/promotions/new' }}
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {promotions.length === 0 && !error ? (
        <EmptyState title="No promotions" description="Create a promotion to reward customers." />
      ) : (
        <PromotionsTable promotions={promotions} />
      )}
    </>
  );
}
