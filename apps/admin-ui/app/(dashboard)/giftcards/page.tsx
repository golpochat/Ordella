import { GiftCardsPanel } from '@/components/giftcards/gift-cards-panel';
import { PageHeader } from '@/components/ui/page-header';

export default function GiftCardsPage() {
  return (
    <>
      <PageHeader
        title="Gift Cards & Store Credit"
        description="Issue gift cards, manage balances, and adjust customer store credit."
      />
      <GiftCardsPanel />
    </>
  );
}
