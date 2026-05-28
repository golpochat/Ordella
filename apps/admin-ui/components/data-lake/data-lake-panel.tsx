'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  createDataLakeExport,
  listPipelineRuns,
  runDataPipeline,
  streamIngest,
  type DataLakeDashboard,
  type DataLakeExport,
  type DataLakePipeline,
  type DataLakePipelineRun,
  type DataLakeSchema,
  type DataLakeWarehouseTable,
} from '@/lib/api/admin/data-lake';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';

type DataLakePanelProps = {
  dashboard: DataLakeDashboard | null;
  schemas: DataLakeSchema[];
  pipelineRuns: DataLakePipelineRun[];
  exports: DataLakeExport[];
};

export function DataLakePanel({ dashboard, schemas, pipelineRuns: initialRuns, exports: initialExports }: DataLakePanelProps) {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const api = useMemo(() => createBrowserApiClient(), []);
  const pipelines = dashboard?.pipelines ?? [];
  const zones = dashboard?.zones ?? [];
  const [runs, setRuns] = useState(initialRuns);
  const [exportRows, setExportRows] = useState(initialExports);
  const [selectedPipeline, setSelectedPipeline] = useState(pipelines[0]?.pipelineKey ?? 'stream-event-bus');
    async function handleRunPipeline() {
    try {
      await runDataPipeline(api, { pipelineKey: selectedPipeline, runMode: 'incremental' });
      setRuns(await listPipelineRuns(api));
      toastSuccess(`Pipeline ${selectedPipeline} completed.`);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function handleStreamIngest() {
    try {
      const result = await streamIngest(api, { limit: 200 });
      toastInfo(`Stream ingest: ${String(result.recordsOut)} records written (${String(result.recordsDeduped)} deduped).`);
      setRuns(await listPipelineRuns(api));
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function handleExport(target: string) {
    try {
      const row = await createDataLakeExport(api, { target, entityType: 'orders', zoneKey: 'analytics', piiMasked: true });
      setExportRows((current) => [row, ...current]);
      toastSuccess(`Export to ${target} succeeded.`);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <MetricGrid columns={4}>
        <Metric title="Zones" value={zones.length} />
        <Metric title="Pipelines" value={pipelines.length} />
        <Metric title="Failed runs" value={dashboard?.failedRunCount ?? 0} />
        <Metric title="Features" value={dashboard?.featureCount ?? 0} />
      </MetricGrid>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data freshness</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Zone</TableHead>
                  <TableHead>Last ingest</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {(dashboard?.freshness ?? []).map((row) => (
                  <TableRow key={row.zoneKey}>
                    <TableCell>{row.zoneKey}</TableCell>
                    <TableCell>{row.lastIngestedAt ? formatDate(row.lastIngestedAt) : '—'}</TableCell>
                    <TableCell>
                      <Tag variant={row.stale ? 'error' : 'neutral'}><TagLabel>{row.stale ? 'stale' : 'fresh'}</TagLabel></Tag>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline orchestration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={selectedPipeline}
              onChange={(e) => setSelectedPipeline(e.target.value)}
            >
              {pipelines.map((p: DataLakePipeline) => (
                <option key={p.id} value={p.pipelineKey}>{p.displayName}</option>
              ))}
            </Select>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void handleRunPipeline()}>Run pipeline</Button>
              <Button type="button" variant="outline" onClick={() => void handleStreamIngest()}>Stream from Event Bus</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schema browser</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Entity</TableHead>
                  <TableHead>Version</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {schemas.map((schema) => (
                  <TableRow key={schema.id}>
                    <TableCell>{schema.entityType}</TableCell>
                    <TableCell>v{schema.version}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warehouse tables (star schema)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Rows</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {(dashboard?.warehouseTables ?? []).map((table: DataLakeWarehouseTable) => (
                  <TableRow key={table.id}>
                    <TableCell>{table.tableKey}</TableCell>
                    <TableCell>{table.tableKind}</TableCell>
                    <TableCell>{table.rowCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingestion errors & recent runs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>In / Out</TableHead>
                <TableHead>Rejected</TableHead>
                <TableHead>Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {runs.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>
                    <Tag variant={run.status === 'failed' ? 'error' : 'neutral'}><TagLabel>{run.status}</TagLabel></Tag>
                  </TableCell>
                  <TableCell>{run.runMode}</TableCell>
                  <TableCell>{run.recordsIn} / {run.recordsOut}</TableCell>
                  <TableCell>{run.recordsRejected}</TableCell>
                  <TableCell>{formatDate(run.startedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data export tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {['analytics', 'ai_assistant', 'marketing', 'forecast', 'power_bi', 'looker', 'tableau', 'gdpr'].map((target) => (
              <Button key={target} type="button" variant="outline" size="sm" onClick={() => void handleExport(target)}>
                Export → {target}
              </Button>
            ))}
          </div>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Target</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rows</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {exportRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.target}</TableCell>
                  <TableCell>{row.entityType}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.rowCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}

