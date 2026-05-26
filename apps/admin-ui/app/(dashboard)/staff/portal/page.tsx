import { createServerApiClient } from '@/lib/api/server';
import { getEmployeeSchedulePortal } from '@/lib/api/admin/staff-scheduling';
import { EmployeePortalPanel } from '@/components/staff/employee-portal-panel';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { getErrorMessage } from '@/lib/utils';

type EmployeePortalPageProps = {
  searchParams: { from?: string; to?: string };
};

export default async function EmployeePortalPage({ searchParams }: EmployeePortalPageProps) {
  let portal: Awaited<ReturnType<typeof getEmployeeSchedulePortal>> | null = null;
  let error: string | null = null;
  try {
    portal = await getEmployeeSchedulePortal(createServerApiClient(), searchParams);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Portal"
        description="View assigned shifts, clock in or out, request time off, and ask for shift swaps."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {portal ? <EmployeePortalPanel initialPortal={portal} /> : null}
    </div>
  );
}
