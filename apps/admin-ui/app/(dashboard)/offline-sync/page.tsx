import { OfflineSyncPanel } from '@/components/offline-sync/offline-sync-panel';
import {
  getOfflineSyncDashboard,
  listOfflineConflicts,
  listOfflineLogs,
  listOfflineSettings,
} from '@/lib/api/admin/offline-sync';
import type { LocationListItem } from '@/lib/api/locations';
import { createServerApiClient } from '@/lib/api/server';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { getErrorMessage } from '@/lib/utils';

export default async function OfflineSyncPage() {
  const api = createServerApiClient();
  let dashboard: Awaited<ReturnType<typeof getOfflineSyncDashboard>> | null = null;
  let settings: Awaited<ReturnType<typeof listOfflineSettings>> = [];
  let logs: Awaited<ReturnType<typeof listOfflineLogs>> = [];
  let conflicts: Awaited<ReturnType<typeof listOfflineConflicts>> = [];
  let locations: LocationListItem[] = [];
  let error: string | null = null;

  try {
    [dashboard, settings, logs, conflicts, locations] = await Promise.all([
      getOfflineSyncDashboard(api),
      listOfflineSettings(api),
      listOfflineLogs(api),
      listOfflineConflicts(api),
      api.getData<LocationListItem[]>('locations/list'),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Offline & Edge Sync"
        description="Control offline mode per location, monitor edge devices, inspect sync logs, resolve conflicts, and force sync pending work."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      <OfflineSyncPanel
        dashboard={dashboard}
        settings={settings}
        logs={logs}
        conflicts={conflicts}
        locations={locations}
      />
    </>
  );
}
