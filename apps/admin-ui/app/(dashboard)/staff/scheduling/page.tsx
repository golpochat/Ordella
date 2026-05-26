import { createServerApiClient } from '@/lib/api/server';
import { getLaborForecast, getStaffRoster } from '@/lib/api/admin/staff-scheduling';
import type { LocationListItem } from '@/lib/api/locations';
import type { StaffMember } from '@/lib/api/staff';
import { StaffSchedulingPanel } from '@/components/staff/staff-scheduling-panel';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { getErrorMessage } from '@/lib/utils';

type StaffSchedulingPageProps = {
  searchParams: { from?: string; to?: string; locationId?: string; view?: 'week' | 'month' };
};

export default async function StaffSchedulingPage({ searchParams }: StaffSchedulingPageProps) {
  const api = createServerApiClient();
  let data: Awaited<ReturnType<typeof getStaffRoster>> | null = null;
  let forecast: Awaited<ReturnType<typeof getLaborForecast>> | null = null;
  let staff: StaffMember[] = [];
  let locations: LocationListItem[] = [];
  let error: string | null = null;

  try {
    [data, forecast, staff, locations] = await Promise.all([
      getStaffRoster(api, searchParams),
      getLaborForecast(api, searchParams),
      api.getData<StaffMember[]>('staff/list'),
      api.getData<LocationListItem[]>('locations/list'),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Scheduling"
        description="Build weekly and monthly rosters, detect conflicts, use shift templates, and track labor cost."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {data && forecast ? <StaffSchedulingPanel initialRoster={data} initialForecast={forecast} staff={staff} locations={locations} /> : null}
    </div>
  );
}
