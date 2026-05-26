import { DeviceManagementPanel } from '@/components/hardware/device-management-panel';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { createServerApiClient } from '@/lib/api/server';
import { fetchHardwareSummary, listHardwareDevices } from '@/lib/api/admin/hardware';
import type { LocationListItem } from '@/lib/api/locations';
import { getErrorMessage } from '@/lib/utils';

export default async function DevicesPage() {
  const api = createServerApiClient();
  let devices: Awaited<ReturnType<typeof listHardwareDevices>> = [];
  let summary: Awaited<ReturnType<typeof fetchHardwareSummary>> | null = null;
  let locations: LocationListItem[] = [];
  let error: string | null = null;

  try {
    [devices, summary, locations] = await Promise.all([
      listHardwareDevices(api),
      fetchHardwareSummary(api),
      api.getData<LocationListItem[]>('locations/list'),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Hardware & IoT"
        description="Register devices, monitor heartbeats, dispatch POS/KDS commands, and review IoT events."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {summary ? <DeviceManagementPanel initialDevices={devices} initialSummary={summary} locations={locations} /> : null}
    </>
  );
}
