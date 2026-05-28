'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  getWorkflow,
  getWorkflowRun,
  listWorkflowRuns,
  resolveApproval,
  saveWorkflowCanvas,
  startWorkflowRun,
  type OrchestrationDashboard,
  type Workflow,
  type WorkflowDetail,
  type WorkflowRun,
} from '@/lib/api/admin/orchestration';
import { WorkflowBuilder } from './workflow-builder';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';
import { PanelEmpty } from '@/components/ui/admin-empty-state';

type OrchestrationPanelProps = {
  dashboard: OrchestrationDashboard | null;
  workflows: Workflow[];
  runs: WorkflowRun[];
  approvals: Array<Record<string, unknown>>;
  deadLetters: Array<Record<string, unknown>>;
  initialWorkflowDetail: WorkflowDetail | null;
};

export function OrchestrationPanel({
  dashboard,
  workflows: initialWorkflows,
  runs: initialRuns,
  approvals,
  deadLetters,
  initialWorkflowDetail,
}: OrchestrationPanelProps) {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const api = useMemo(() => createBrowserApiClient(), []);
  const workflows = initialWorkflows;
  const [runs, setRuns] = useState(initialRuns);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(initialWorkflowDetail?.workflow.id ?? workflows[0]?.id ?? '');
  const [workflowDetail, setWorkflowDetail] = useState<WorkflowDetail | null>(initialWorkflowDetail);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(runs[0]?.id ?? null);
  const [runDetail, setRunDetail] = useState<Awaited<ReturnType<typeof getWorkflowRun>> | null>(null);
    async function loadWorkflow(id: string) {
    try {
      setWorkflowDetail(await getWorkflow(api, id));
      setSelectedWorkflowId(id);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function handleSaveCanvas(payload: Parameters<typeof saveWorkflowCanvas>[2]) {
    if (!selectedWorkflowId) return;
    try {
      const detail = await saveWorkflowCanvas(api, selectedWorkflowId, payload);
      setWorkflowDetail(detail);
      toastSuccess('Workflow canvas saved.');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function handleStartRun(sandbox = false) {
    if (!selectedWorkflowId) return;
    try {
      const result = await startWorkflowRun(api, selectedWorkflowId, { sandbox });
      setRuns(await listWorkflowRuns(api));
      setSelectedRunId(result.run.id);
      setRunDetail(result);
      toastSuccess(sandbox ? 'Sandbox run completed.' : 'Workflow run started.');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function inspectRun(runId: string) {
    try {
      setRunDetail(await getWorkflowRun(api, runId));
      setSelectedRunId(runId);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function handleApprove(approvalId: string, decision: 'approved' | 'rejected') {
    try {
      await resolveApproval(api, approvalId, { decision });
      toastSuccess(`Approval ${decision}.`);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <MetricGrid columns={5}>
        <Metric title="Workflows" value={dashboard?.workflowCount ?? workflows.length} />
        <Metric title="Active runs" value={dashboard?.activeRuns ?? 0} />
        <Metric title="Failed runs" value={dashboard?.failedRuns ?? 0} />
        <Metric title="Pending approvals" value={dashboard?.pendingApprovals ?? approvals.length} />
        <Metric title="Dead letters" value={dashboard?.openDeadLetters ?? deadLetters.length} />
      </MetricGrid>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Workflows</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={selectedWorkflowId}
              onChange={(e) => void loadWorkflow(e.target.value)}
            >
              {workflows.map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({w.status})</option>
              ))}
            </Select>
            <Button type="button" variant="outline" onClick={() => void handleStartRun(true)}>Sandbox run</Button>
            <Button type="button" onClick={() => void handleStartRun(false)}>Run now</Button>
          </div>
        </CardHeader>
        <CardContent>
          {workflowDetail ? (
            <WorkflowBuilder detail={workflowDetail} onSave={handleSaveCanvas} />
          ) : (
            <p className="text-sm text-muted-foreground">Select a workflow to open the builder.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Run history</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Sandbox</TableHead>
                  <TableHead>Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {runs.map((run) => (
                  <TableRow key={run.id} className="cursor-pointer" onClick={() => void inspectRun(run.id)}>
                    <TableCell>
                      <Tag variant={run.status === 'failed' ? 'error' : 'neutral'}><TagLabel>{run.status}</TagLabel></Tag>
                    </TableCell>
                    <TableCell>{run.triggerType}</TableCell>
                    <TableCell>{run.sandboxRun ? 'yes' : 'no'}</TableCell>
                    <TableCell>{formatDate(run.startedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step logs {selectedRunId ? `· ${selectedRunId.slice(0, 8)}` : ''}</CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            {runDetail?.stepRuns.length ? (
              <div className="space-y-3">
                {runDetail.stepRuns.map((step) => (
                  <div key={step.id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{step.stepKey}</span>
                      <Tag variant={step.status === 'failed' ? 'error' : 'neutral'}><TagLabel>{step.status}</TagLabel></Tag>
                    </div>
                    {step.errorTrace ? <p className="mt-1 text-destructive">{step.errorTrace}</p> : null}
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {step.logs.map((log, i) => (
                        <li key={`${log.at}-${i}`}>[{log.level}] {log.message}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a run to view step-level logs and error traces.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Approval inbox</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {approvals.length ? approvals.map((row) => (
              <div key={String(row.id)} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span>Run {String(row.workflowRunId).slice(0, 8)}…</span>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={() => void handleApprove(String(row.id), 'approved')}>Approve</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => void handleApprove(String(row.id), 'rejected')}>Reject</Button>
                </div>
              </div>
            )) : <PanelEmpty title="No pending approvals" description="Content will appear here when available." />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dead letters</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Error</TableHead>
                  <TableHead>Attempts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {deadLetters.map((row) => (
                  <TableRow key={String(row.id)}>
                    <TableCell className="max-w-xs truncate">{String(row.errorMessage)}</TableCell>
                    <TableCell>{String(row.attempts)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Stack>
  );
}

