import { PageHeader } from '@/components/ui/page-header';
import { LoyaltyPanel } from '@/components/loyalty/loyalty-panel';

export default function LoyaltyPage() {
  return (
    <>
      <PageHeader
        title="Loyalty & Rewards"
        description="Manage customer rewards, points, redemptions, and loyalty history."
      />
      <LoyaltyPanel />
    </>
  );
}
