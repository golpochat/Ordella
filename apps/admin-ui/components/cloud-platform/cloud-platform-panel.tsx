'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  listCloudRegions,
  rollbackCloudDeployment,
  saveCloudResidency,
  startCloudDeployment,
  type CloudDashboard,
  type CloudDeployment,
  type CloudEdgeNode,
  type CloudFailoverRule,
  type CloudRegion,
  type CloudRegionMetrics,
  type CloudResidencyPolicy,
} from '@/lib/api/admin/cloud-platform';
import { getErrorMessage } from '@/lib/utils';
import { Metric, MetricGrid } from '@/components/ui/admin-card';

type CloudPlatformPanelProps = {
  dashboard: CloudDashboard | null;
  regions: CloudRegion[];
  residency: CloudResidencyPolicy | null;
  failoverRules: CloudFailoverRule[];
  metrics: CloudRegionMetrics[];
  edgeNodes: CloudEdgeNode[];
  deployments: CloudDeployment[];
};


const PROVIDER_LABELS: Record<string, string> = {
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'GCP',
};

export function CloudPlatformPanel({
  dashboard,
  regions: initialRegions,
  residency: initialResidency,
  failoverRules: initialFailover,
  metrics: initialMetrics,
  edgeNodes: initialEdgeNodes,
  deployments: initialDeployments,
}: CloudPlatformPanelProps) {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useAdminToast();
  const api = useMemo(() => createBrowserApiClient(), []);
  const [regions, setRegions] = useState(initialRegions);
  const [residency, setResidency] = useState(initialResidency);
  const [failoverRules] = useState(initialFailover);
  const [metrics] = useState(initialMetrics);
  const [edgeNodes] = useState(initialEdgeNodes);
  const [deployments, setDeployments] = useState(initialDeployments);
  const [selectedRegionId, setSelectedRegionId] = useState(initialRegions[0]?.id ?? '');
    const heatmap = dashboard?.latencyHeatmap ?? {};

  async function handleResidencyToggle(field: 'euOnlyMode' | 'usOnlyMode' | 'apacResidency', value: boolean) {
    try {
      const updated = await saveCloudResidency(api, { [field]: value });
      setResidency(updated);
      toastSuccess('Residency policy updated.');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function handleDeploy(deploymentType: 'blue_green' | 'canary') {
    if (!selectedRegionId) return;
    try {
      const row = await startCloudDeployment(api, {
        regionId: selectedRegionId,
        deploymentType,
        strategy: deploymentType,
        canaryPercent: deploymentType === 'canary' ? 10 : 0,
      });
      setDeployments((current) => [row, ...current]);
      toastSuccess(`${deploymentType} deployment started.`);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function handleRollback(deploymentId: string) {
    try {
      const row = await rollbackCloudDeployment(api, deploymentId);
      setDeployments((current) => [row, ...current]);
      toastSuccess('Rollback deployment initiated.');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function refreshRegions() {
    setRegions(await listCloudRegions(api));
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <MetricGrid columns={6}>
        <Metric title="Regions" value={dashboard?.regions ?? regions.length} />
        <Metric title="AWS" value={dashboard?.multiCloud.aws ?? 0} />
        <Metric title="Azure" value={dashboard?.multiCloud.azure ?? 0} />
        <Metric title="GCP" value={dashboard?.multiCloud.gcp ?? 0} />
        <Metric title="Edge uptime" value={`${dashboard?.edgeUptimePercent ?? 100}%`} />
        <Metric title="Open alerts" value={dashboard?.openAlerts ?? 0} />
      </MetricGrid>

      <Card>
        <CardHeader>
          <CardTitle>Region selector</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            className="w-full max-w-md rounded-md border bg-background px-3 py-2 text-sm"
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.displayName} ({PROVIDER_LABELS[r.cloudProvider] ?? r.cloudProvider})
                {r.isPrimary ? ' — primary' : ''}
              </option>
            ))}
          </Select>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => void handleDeploy('blue_green')}>
              Blue/green deploy
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => void handleDeploy('canary')}>
              Canary release
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => void refreshRegions()}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latency heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(heatmap).map(([code, vals]) => (
                <div key={code} className="rounded border bg-muted/30 p-3 text-center">
                  <p className="font-mono text-xs">{code}</p>
                  <p className="text-sm">p50 {vals.p50}ms</p>
                  <p className="text-xs text-muted-foreground">err {vals.errorRate}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Residency policy editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={residency?.euOnlyMode ? 'brand' : 'outline'}
                onClick={() => void handleResidencyToggle('euOnlyMode', !residency?.euOnlyMode)}
              >
                EU-only
              </Button>
              <Button
                type="button"
                size="sm"
                variant={residency?.usOnlyMode ? 'brand' : 'outline'}
                onClick={() => void handleResidencyToggle('usOnlyMode', !residency?.usOnlyMode)}
              >
                US-only
              </Button>
              <Button
                type="button"
                size="sm"
                variant={residency?.apacResidency ? 'brand' : 'outline'}
                onClick={() => void handleResidencyToggle('apacResidency', !residency?.apacResidency)}
              >
                APAC residency
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Failover: {dashboard?.routing.failoverMode ?? 'active_passive'} · Storefront geo:{' '}
              {dashboard?.routing.storefrontGeo ? 'on' : 'off'} · POS low-latency:{' '}
              {dashboard?.routing.posLowLatency ? 'on' : 'off'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cloud regions & capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Region</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Residency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {regions.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.displayName}
                    {r.isPrimary ? (
                      <Tag className="ml-2" variant="outline"><TagLabel>
                        primary
                      </TagLabel></Tag>
                    ) : null}
                  </TableCell>
                  <TableCell>{PROVIDER_LABELS[r.cloudProvider] ?? r.cloudProvider}</TableCell>
                  <TableCell>{r.capabilities?.latencyClass ?? '—'}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">
                    {(r.capabilities?.supportedModules as string[] | undefined)?.join(', ') ?? '—'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {(r.capabilities?.dataResidencyZones as string[] | undefined)?.join(', ') ?? '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Region performance metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>p50</TableHead>
                  <TableHead>Error %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {metrics.map((m) => (
                  <TableRow key={m.regionId}>
                    <TableCell>{m.regionCode}</TableCell>
                    <TableCell>
                      <Tag variant={m.metrics?.healthStatus === 'healthy' ? 'outline' : 'error'}><TagLabel>
                        {m.metrics?.healthStatus ?? 'unknown'}
                      </TagLabel></Tag>
                    </TableCell>
                    <TableCell>{m.metrics?.latencyP50Ms ?? '—'}ms</TableCell>
                    <TableCell>{m.metrics ? String(m.metrics.errorRatePercent) : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failover controls</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Mode</TableHead>
                  <TableHead>Auto</TableHead>
                  <TableHead>RPO</TableHead>
                  <TableHead>RTO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {failoverRules.length ? (
                  failoverRules.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>{f.mode}</TableCell>
                      <TableCell>{f.autoFailover ? 'yes' : 'no'}</TableCell>
                      <TableCell>{f.rpoSeconds}s</TableCell>
                      <TableCell>{f.rtoSeconds}s</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      No failover rules configured
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Edge nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uptime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {edgeNodes.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>{n.displayName}</TableCell>
                    <TableCell>{n.nodeType}</TableCell>
                    <TableCell>
                      <Tag variant={n.status === 'online' ? 'outline' : 'neutral'}><TagLabel>{n.status}</TagLabel></Tag>
                    </TableCell>
                    <TableCell>{String(n.uptimePercent)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {deployments.slice(0, 8).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.deploymentKey}</TableCell>
                    <TableCell>{d.deploymentType}</TableCell>
                    <TableCell>
                      <Tag variant={d.status === 'completed' ? 'outline' : 'neutral'}><TagLabel>{d.status}</TagLabel></Tag>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={d.status === 'in_progress'}
                        onClick={() => void handleRollback(d.id)}
                      >
                        Rollback
                      </Button>
                    </TableCell>
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
