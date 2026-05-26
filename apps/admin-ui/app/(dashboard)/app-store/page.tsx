import { AppStorePanel } from '@/components/app-store/app-store-panel';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { createServerApiClient } from '@/lib/api/server';
import {
  fetchAppStoreAnalytics,
  fetchPartnerDashboard,
  listMarketplaceApps,
} from '@/lib/api/admin/app-store';
import { getErrorMessage } from '@/lib/utils';

export default async function AppStorePage() {
  const api = createServerApiClient();
  let apps: Awaited<ReturnType<typeof listMarketplaceApps>> = [];
  let analytics: Awaited<ReturnType<typeof fetchAppStoreAnalytics>> | null = null;
  let partnerDashboard: Awaited<ReturnType<typeof fetchPartnerDashboard>> | null = null;
  let error: string | null = null;

  try {
    [apps, analytics, partnerDashboard] = await Promise.all([
      listMarketplaceApps(api),
      fetchAppStoreAnalytics(api),
      fetchPartnerDashboard(api),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="App Store 2.0"
        description="Browse marketplace apps, approve permissions, manage installs, meter usage, review apps, and onboard partners."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {analytics && partnerDashboard ? (
        <AppStorePanel
          initialApps={apps}
          initialAnalytics={analytics}
          initialPartnerDashboard={partnerDashboard}
        />
      ) : null}
    </>
  );
}
