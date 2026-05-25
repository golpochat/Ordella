import { SubscriptionsPanel } from '@/components/subscriptions/subscriptions-panel';
import { fetchSubscriptionAnalytics, listSubscriptions } from '@/lib/api/admin/subscriptions';
import { createServerApiClient } from '@/lib/api/server';

export default async function SubscriptionsPage() {
  const api = createServerApiClient();
  const [subscriptions, analytics] = await Promise.all([
    listSubscriptions(api),
    fetchSubscriptionAnalytics(api),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">Manage customer recurring orders across pickup, delivery, and in-store channels.</p>
      </div>
      <SubscriptionsPanel initialSubscriptions={subscriptions} analytics={analytics} />
    </div>
  );
}
