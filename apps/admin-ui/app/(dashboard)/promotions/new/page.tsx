import { PageHeader } from '@/components/ui/page-header';
import { PromotionForm } from '@/components/promotions/promotion-form';

export default function NewPromotionPage() {
  return (
    <>
      <PageHeader title="New promotion" description="Define rules and actions" />
      <PromotionForm />
    </>
  );
}
