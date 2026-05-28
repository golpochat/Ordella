import { AutonomousRetailPanel } from '@/components/autonomous-retail/autonomous-retail-panel';
import {
  getAutonomousDashboard,
  listAutonomousActions,
  listAutonomousDecisions,
  listAutonomousPolicies,
} from '@/lib/api/admin/autonomous-retail';
import { createServerApiClient } from '@/lib/api/server';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { getErrorMessage } from '@/lib/utils';

export default async function AutonomousRetailPage() {
  const api = createServerApiClient();
  let error: string | null = null;
  let dashboard: Awaited<ReturnType<typeof getAutonomousDashboard>> | null = null;
  let policies: Awaited<ReturnType<typeof listAutonomousPolicies>> = [];
  let pendingDecisions: Awaited<ReturnType<typeof listAutonomousDecisions>> = [];
  let actions: Awaited<ReturnType<typeof listAutonomousActions>> = [];

  try {
    [dashboard, policies, pendingDecisions, actions] = await Promise.all([
      getAutonomousDashboard(api),
      listAutonomousPolicies(api),
      listAutonomousDecisions(api, 'pending'),
      listAutonomousActions(api),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Autonomous Retail"
        description="AI-driven pricing, replenishment, staffing, promotions, and delivery — with safety constraints, explainability, and human override."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      <AutonomousRetailPanel dashboard={dashboard} policies={policies} pendingDecisions={pendingDecisions} actions={actions} />
    </>
  );
}
