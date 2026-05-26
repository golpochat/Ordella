import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { EnterpriseAdminPanel } from '@/components/enterprise/enterprise-admin-panel';
import { createServerApiClient } from '@/lib/api/server';
import { fetchEnterpriseDashboard, fetchEnterpriseHierarchy } from '@/lib/api/admin/enterprise';
import type { Permission, Role, StaffMember } from '@/lib/api/staff';
import { getErrorMessage } from '@/lib/utils';

export default async function EnterprisePage() {
  const api = createServerApiClient();
  let hierarchy: Awaited<ReturnType<typeof fetchEnterpriseHierarchy>> | null = null;
  let dashboard: Awaited<ReturnType<typeof fetchEnterpriseDashboard>> | null = null;
  let staff: StaffMember[] = [];
  let roles: Role[] = [];
  let permissions: Permission[] = [];
  let error: string | null = null;

  try {
    [hierarchy, dashboard, staff, roles, permissions] = await Promise.all([
      fetchEnterpriseHierarchy(api),
      fetchEnterpriseDashboard(api),
      api.getData<StaffMember[]>('staff/list'),
      api.getData<Role[]>('roles/list'),
      api.getData<Permission[]>('permissions'),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Enterprise Admin"
        description="Manage organization hierarchy, regional access, custom roles, dashboards, inherited settings, and SSO policy."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {hierarchy && dashboard ? (
        <EnterpriseAdminPanel
          initialHierarchy={hierarchy}
          initialDashboard={dashboard}
          staff={staff}
          roles={roles}
          permissions={permissions}
        />
      ) : null}
    </>
  );
}
