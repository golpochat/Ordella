import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { getOnboardingProgress, getSetupStatus } from '@/lib/api/onboarding';
import { PageHeader } from '@/components/ui/page-header';
import { GettingStartedPanel } from '@/components/dashboard/getting-started-panel';
import { AnalyticsDashboardPanel } from '@/components/analytics/analytics-dashboard-panel';
import { AdvancedSearchPanel } from '@/components/search/advanced-search-panel';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { getErrorMessage } from '@/lib/utils';

type DashboardPageProps = {
  searchParams: { from?: string; to?: string; locationId?: string };
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  let showGettingStarted = false;
  let setupError: string | null = null;

  try {
    const client = createServerApiClient();
    const [status, progress] = await Promise.all([
      getSetupStatus(client),
      getOnboardingProgress(client),
    ]);
    showGettingStarted =
      progress.isComplete && (!status.hasCatalog || !status.hasOrders);
  } catch (err) {
    setupError = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Business sales, orders, catalog performance, and inventory insights"
      />
      {setupError ? <ApiErrorBanner message={setupError} /> : null}
      {showGettingStarted ? <GettingStartedPanel /> : null}
      <div className="mb-6">
        <AdvancedSearchPanel />
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading analytics…</p>}>
        <AnalyticsDashboardPanel searchParams={searchParams} />
      </Suspense>
    </>
  );
}
