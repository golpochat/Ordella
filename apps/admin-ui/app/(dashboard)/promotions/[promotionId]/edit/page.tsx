import { notFound } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server';
import { listPromotions } from '@/lib/api/admin/promotions';
import { PageHeader } from '@/components/ui/page-header';
import { PromotionForm } from '@/components/promotions/promotion-form';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { getErrorMessage } from '@/lib/utils';

type EditPromotionPageProps = {
  params: { promotionId: string };
};

export default async function EditPromotionPage({ params }: EditPromotionPageProps) {
  try {
    const promotions = await listPromotions(createServerApiClient());
    const promotion = promotions.find((p) => p.id === params.promotionId);
    if (!promotion) notFound();

    return (
      <>
        <PageHeader title="Edit promotion" description={promotion.name} />
        <PromotionForm promotion={promotion} />
      </>
    );
  } catch (err) {
    return (
      <>
        <PageHeader title="Edit promotion" />
        <ApiErrorBanner message={getErrorMessage(err)} />
      </>
    );
  }
}
