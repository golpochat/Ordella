import { SubscriptionDetailPanel } from '@/components/subscriptions/subscription-detail-panel';
import { DetailPage, DetailPageHeader } from '@/components/ui/admin-detail';
import { getSubscription } from '@/lib/api/admin/subscriptions';
import { createServerApiClient } from '@/lib/api/server';

type Props = {
  params: { subscriptionId: string };
};

export default async function SubscriptionDetailPage({ params }: Props) {
  const subscription = await getSubscription(createServerApiClient(), params.subscriptionId);

  return (
    <DetailPage>
      <DetailPageHeader
        breadcrumb={[
          { label: 'Subscriptions', href: '/subscriptions' },
          { label: 'Detail' },
        ]}
        title="Subscription detail"
        description="Items, schedule, payment method, delivery details, and past runs."
      />
      <SubscriptionDetailPanel initialSubscription={subscription} />
    </DetailPage>
  );
}
