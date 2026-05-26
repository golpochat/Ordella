import { MarketingJourneysPanel } from '@/components/marketing/marketing-journeys-panel';
import { SubNav } from '@/components/ui/sub-nav';
import { listJourneys, listSegments } from '@/lib/api/admin/marketing';
import { createServerApiClient } from '@/lib/api/server';
import { MARKETING_SUBNAV } from '@/lib/navigation';

export default async function MarketingJourneysPage() {
  const api = createServerApiClient();
  const [journeys, segments] = await Promise.all([
    listJourneys(api),
    listSegments(api),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Marketing Journeys</h1>
        <p className="text-sm text-muted-foreground">Build trigger-based customer flows with delays, conditions, and actions.</p>
      </div>
      <SubNav items={MARKETING_SUBNAV} />
      <MarketingJourneysPanel initialJourneys={journeys} segments={segments} />
    </div>
  );
}
