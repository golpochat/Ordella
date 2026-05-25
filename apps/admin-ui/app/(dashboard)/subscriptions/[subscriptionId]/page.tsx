import { SubscriptionDetailPanel } from '@/components/subscriptions/subscription-detail-panel';
import { getSubscription } from '@/lib/api/admin/subscriptions';
import { createServerApiClient } from '@/lib/api/server';

type Props = {
  params: { subscriptionId: string };
};

export default async function SubscriptionDetailPage({ params }: Props) {
  const subscription = await getSubscription(createServerApiClient(), params.subscriptionId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Subscription Detail</h1>
        <p className="text-sm text-muted-foreground">Review items, schedule, payment method, delivery details, and past runs.</p>
      </div>
      <SubscriptionDetailPanel initialSubscription={subscription} />
    </div>
  );
}
