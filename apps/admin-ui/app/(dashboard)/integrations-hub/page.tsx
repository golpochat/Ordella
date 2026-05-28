import { IntegrationsHubPanelLazy as IntegrationsHubPanel } from '@/lib/lazy-panels';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { createServerApiClient } from '@/lib/api/server';
import {
  listIntegrationApps,
  listIntegrationEvents,
  listIntegrationLogs,
  listIntegrationProviders,
} from '@/lib/api/admin/integrations';
import { getErrorMessage } from '@/lib/utils';

export default async function IntegrationsHubPage() {
  const api = createServerApiClient();
  let providers: Awaited<ReturnType<typeof listIntegrationProviders>> = [];
  let apps: Awaited<ReturnType<typeof listIntegrationApps>> = [];
  let logs: Awaited<ReturnType<typeof listIntegrationLogs>> = [];
  let events: Awaited<ReturnType<typeof listIntegrationEvents>> = [];
  let error: string | null = null;

  try {
    [providers, apps, logs, events] = await Promise.all([
      listIntegrationProviders(api),
      listIntegrationApps(api),
      listIntegrationLogs(api),
      listIntegrationEvents(api),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Integrations Hub"
        description="Install connectors, configure providers, test connections, run syncs, and review integration logs."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      <IntegrationsHubPanel
        initialProviders={providers}
        initialApps={apps}
        initialLogs={logs}
        initialEvents={events}
      />
    </>
  );
}
