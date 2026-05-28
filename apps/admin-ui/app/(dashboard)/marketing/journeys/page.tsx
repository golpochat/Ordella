import { MarketingJourneysPanel } from '@/components/marketing/marketing-journeys-panel';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { listJourneys, listSegments } from '@/lib/api/admin/marketing';
import { createServerApiClient } from '@/lib/api/server';
import { MARKETING_SUBNAV } from '@/lib/navigation';

export default async function MarketingJourneysPage() {
  const api = createServerApiClient();
  const [journeys, segments] = await Promise.all([listJourneys(api), listSegments(api)]);

  return (
    <>
      <PageHeader
        title="Marketing Journeys"
        description="Build trigger-based customer flows with delays, conditions, and actions."
        tabs={<SubNav variant="embedded" items={MARKETING_SUBNAV} />}
      />
      <MarketingJourneysPanel initialJourneys={journeys} segments={segments} />
    </>
  );
}
