import { SubscriptionsPanel } from '@/components/subscriptions/subscriptions-panel';
import { PageHeader } from '@/components/ui/page-header';
import { fetchSubscriptionAnalytics, listSubscriptionPlans, listSubscriptions } from '@/lib/api/admin/subscriptions';
import { createServerApiClient } from '@/lib/api/server';

export default async function SubscriptionsPage() {
  const api = createServerApiClient();
  const [subscriptions, analytics, plans] = await Promise.all([
    listSubscriptions(api),
    fetchSubscriptionAnalytics(api),
    listSubscriptionPlans(api),
  ]);

  return (
    <>
      <PageHeader
        title="Subscriptions"
        description="Manage recurring orders, paid memberships, billing rules, and subscriber analytics."
      />
      <SubscriptionsPanel initialSubscriptions={subscriptions} analytics={analytics} initialPlans={plans} />
    </>
  );
}
