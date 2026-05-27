import { DigitalTwinsPanel } from '@/components/digital-twins/digital-twins-panel';
import { getDigitalTwin, getDigitalTwinsDashboard, listDigitalTwins } from '@/lib/api/admin/digital-twins';
import { createServerApiClient } from '@/lib/api/server';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { getErrorMessage } from '@/lib/utils';

export default async function DigitalTwinsPage() {
  const api = createServerApiClient();
  let error: string | null = null;
  let dashboard: Awaited<ReturnType<typeof getDigitalTwinsDashboard>> | null = null;
  let twins: Awaited<ReturnType<typeof listDigitalTwins>> = [];
  let initialDetail: Awaited<ReturnType<typeof getDigitalTwin>> | null = null;

  try {
    [dashboard, twins] = await Promise.all([getDigitalTwinsDashboard(api), listDigitalTwins(api)]);
    if (twins[0]) {
      initialDetail = await getDigitalTwin(api, twins[0].id);
    }
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Twins"
        description="Sandbox simulations for demand, inventory, staffing, delivery, pricing, and promotions — reproducible, tenant-isolated, no production writes."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      <DigitalTwinsPanel dashboard={dashboard} twins={twins} initialDetail={initialDetail} />
    </div>
  );
}
