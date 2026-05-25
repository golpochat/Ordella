import { SubNav } from '@/components/ui/sub-nav';
import { MarketingCampaignsPanel } from '@/components/marketing/marketing-campaigns-panel';
import { fetchMarketingAnalytics, listCampaigns, listSegments } from '@/lib/api/admin/marketing';
import { createServerApiClient } from '@/lib/api/server';
import { MARKETING_SUBNAV } from '@/lib/navigation';

export default async function MarketingCampaignsPage() {
  const api = createServerApiClient();
  const [campaigns, segments, analytics] = await Promise.all([
    listCampaigns(api),
    listSegments(api),
    fetchMarketingAnalytics(api),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Marketing Campaigns</h1>
        <p className="text-sm text-muted-foreground">Create retail-agnostic email and SMS campaigns for customer segments.</p>
      </div>
      <SubNav items={MARKETING_SUBNAV} />
      <MarketingCampaignsPanel initialCampaigns={campaigns} segments={segments} analytics={analytics} />
    </div>
  );
}
