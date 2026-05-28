import { MarketingCampaignsPanel } from '@/components/marketing/marketing-campaigns-panel';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
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
    <>
      <PageHeader
        title="Marketing Campaigns"
        description="Create retail-agnostic email and SMS campaigns for customer segments."
        tabs={<SubNav variant="embedded" items={MARKETING_SUBNAV} />}
      />
      <MarketingCampaignsPanel initialCampaigns={campaigns} segments={segments} analytics={analytics} />
    </>
  );
}
