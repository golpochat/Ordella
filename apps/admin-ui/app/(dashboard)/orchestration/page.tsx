import { OrchestrationPanel } from '@/components/orchestration/orchestration-panel';
import {
  getOrchestrationDashboard,
  getWorkflow,
  listApprovalInbox,
  listDeadLetters,
  listWorkflowRuns,
  listWorkflows,
} from '@/lib/api/admin/orchestration';
import { createServerApiClient } from '@/lib/api/server';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { getErrorMessage } from '@/lib/utils';

export default async function OrchestrationPage() {
  const api = createServerApiClient();
  let error: string | null = null;
  let dashboard: Awaited<ReturnType<typeof getOrchestrationDashboard>> | null = null;
  let workflows: Awaited<ReturnType<typeof listWorkflows>> = [];
  let runs: Awaited<ReturnType<typeof listWorkflowRuns>> = [];
  let approvals: Awaited<ReturnType<typeof listApprovalInbox>> = [];
  let deadLetters: Awaited<ReturnType<typeof listDeadLetters>> = [];
  let initialWorkflowDetail: Awaited<ReturnType<typeof getWorkflow>> | null = null;

  try {
    [dashboard, workflows, runs, approvals, deadLetters] = await Promise.all([
      getOrchestrationDashboard(api),
      listWorkflows(api),
      listWorkflowRuns(api),
      listApprovalInbox(api).catch(() => []),
      listDeadLetters(api),
    ]);
    if (workflows[0]) {
      initialWorkflowDetail = await getWorkflow(api, workflows[0].id);
    }
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orchestration"
        description="Design workflows with drag-and-drop, run event-driven and scheduled pipelines, manage approvals, and monitor step-level execution."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      <OrchestrationPanel
        dashboard={dashboard}
        workflows={workflows}
        runs={runs}
        approvals={approvals}
        deadLetters={deadLetters}
        initialWorkflowDetail={initialWorkflowDetail}
      />
    </div>
  );
}
