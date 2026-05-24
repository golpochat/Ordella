import { createServerApiClient } from '@/lib/api/server';
import { getOnboardingProgress, getSetupStatus } from '@/lib/api/onboarding';
import { PageHeader } from '@/components/ui/page-header';
import { GettingStartedPanel } from '@/components/dashboard/getting-started-panel';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { getErrorMessage } from '@/lib/utils';

export default async function DashboardPage() {
  let showGettingStarted = false;
  let error: string | null = null;

  try {
    const client = createServerApiClient();
    const [status, progress] = await Promise.all([
      getSetupStatus(client),
      getOnboardingProgress(client),
    ]);
    showGettingStarted =
      progress.isComplete && (!status.hasCatalog || !status.hasOrders);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your business on Ordella"
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {showGettingStarted ? <GettingStartedPanel /> : null}
      {!showGettingStarted && !error ? (
        <p className="text-sm text-muted-foreground">
          Use the sidebar to manage catalog, orders, inventory, and reports.
        </p>
      ) : null}
    </>
  );
}
