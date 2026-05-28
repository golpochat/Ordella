import { createServerApiClient } from '@/lib/api/server';
import { listHqLocations } from '@/lib/api/admin/franchise-hq';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { FranchiseLocationsTable } from '@/components/franchise-hq/franchise-hq-tables';
import { FRANCHISE_HQ_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

export default async function FranchiseHqLocationsPage() {
  let locations: Awaited<ReturnType<typeof listHqLocations>> = [];
  let error: string | null = null;
  try {
    locations = await listHqLocations(createServerApiClient());
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader title="Franchise HQ Locations" description="Read-only leaderboard and location performance across the franchise group."
        tabs={<SubNav variant="embedded" items={FRANCHISE_HQ_SUBNAV} />} />
      {error ? <ApiErrorBanner message={error} /> : null}
      {locations.length ? (
        <FranchiseLocationsTable locations={locations} />
      ) : (
        <EmptyState title="No locations" description="Franchise locations will appear here once available." />
      )}
    </>
  );
}
