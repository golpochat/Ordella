'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  installIntegration,
  syncIntegrationNow,
  testIntegrationConnection,
  uninstallIntegration,
  updateIntegration,
  type IntegrationApp,
  type IntegrationEvent,
  type IntegrationLog,
  type IntegrationProvider,
} from '@/lib/api/admin/integrations';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { IrreversibleConfirmDialog } from '@/components/ui/admin-dialog';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';

const CATEGORY_LABELS: Record<string, string> = {
  accounting: 'Accounting',
  erp: 'ERP',
  delivery: 'Delivery',
  marketing: 'Marketing',
  analytics: 'Analytics',
  hardware: 'POS Hardware',
};

export function IntegrationsHubPanel({
  initialProviders,
  initialApps,
  initialLogs,
  initialEvents,
}: {
  initialProviders: IntegrationProvider[];
  initialApps: IntegrationApp[];
  initialLogs: IntegrationLog[];
  initialEvents: IntegrationEvent[];
}) {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const [providers] = useState(initialProviders);
  const [apps, setApps] = useState(initialApps);
  const [logs, setLogs] = useState(initialLogs);
  const [events, setEvents] = useState(initialEvents);
  const [category, setCategory] = useState('all');
  const [providerId, setProviderId] = useState(initialProviders[0]?.id ?? '');
  const [name, setName] = useState(initialProviders[0]?.name ?? '');
  const [config, setConfig] = useState<Record<string, string>>({});
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [syncSchedule, setSyncSchedule] = useState('manual');
  const [conflictResolution, setConflictResolution] = useState('provider_wins');
  const [disconnectTarget, setDisconnectTarget] = useState<IntegrationApp | null>(null);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
    const selectedProvider = providers.find((provider) => provider.id === providerId) ?? providers[0];
  const visibleProviders = category === 'all' ? providers : providers.filter((provider) => provider.category === category);
  const installedProviderIds = useMemo(() => new Set(apps.filter((app) => app.status !== 'disconnected').map((app) => app.providerId)), [apps]);
  const fields = schemaList(selectedProvider?.configSchema.fields);
  const credentialFields = schemaList(selectedProvider?.configSchema.credentials);

  async function submitInstall(event: React.FormEvent) {
    event.preventDefault();
    try {
      const app = await installIntegration(createBrowserApiClient(), {
        providerId,
        name,
        config: compact(config),
        credentials: compact(credentials),
        syncSchedule,
        conflictResolution,
      });
      setApps((current) => [app, ...current.filter((item) => item.id !== app.id)]);
      toastSuccess(`${app.providerName} installed`);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function confirmDisconnect() {
    if (!disconnectTarget) return;
    setDisconnectLoading(true);
    try {
      await uninstallIntegration(createBrowserApiClient(), disconnectTarget.id);
      setApps((current) => current.map((app) => (app.id === disconnectTarget.id ? { ...app, status: 'disconnected' } : app)));
      setDisconnectTarget(null);
      toastSuccess('Connector uninstalled');
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setDisconnectLoading(false);
    }
  }

  async function reconnect(app: IntegrationApp) {
    try {
      const updated = await updateIntegration(createBrowserApiClient(), app.id, { status: 'active', config: app.config });
      setApps((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toastSuccess('Connector reconnected');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function test(app: IntegrationApp) {
    try {
      const result = await testIntegrationConnection(createBrowserApiClient(), app.id);
      toastSuccess(result.message);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function sync(app: IntegrationApp) {
    try {
      const result = await syncIntegrationNow(createBrowserApiClient(), app.id);
      const updated = { ...app, lastSyncAt: new Date().toISOString(), lastSyncStatus: 'success' };
      setApps((current) => current.map((item) => (item.id === app.id ? updated : item)));
      setEvents((current) => [
        {
          id: result.eventId,
          integrationId: app.id,
          eventType: 'sync.manual',
          externalId: null,
          payload: { syncedObjects: result.syncedObjects },
          status: 'processed',
          processedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
      setLogs((current) => [
        {
          id: result.eventId,
          tenantId: app.tenantId,
          integrationId: app.id,
          level: 'success',
          action: 'integration.sync_completed',
          message: `${app.providerName} sync completed`,
          metadata: { syncedObjects: result.syncedObjects },
          requestPayload: { mode: 'manual' },
          responsePayload: { syncedObjects: result.syncedObjects },
          errorCode: null,
          durationMs: null,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
      toastInfo(`Sync queued for ${result.syncedObjects.join(', ')}`);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <IrreversibleConfirmDialog
        open={!!disconnectTarget}
        onOpenChange={(open) => {
          if (!open) setDisconnectTarget(null);
        }}
        title={disconnectTarget ? `Uninstall ${disconnectTarget.name}?` : 'Uninstall connector?'}
        description="Sync jobs and credentials for this connector will be removed."
        confirmLabel="Uninstall"
        loading={disconnectLoading}
        onConfirm={confirmDisconnect}
      />
      <MetricGrid columns={4}>
        <MetricCard title="Installed" value={String(apps.filter((app) => app.status === 'active').length)} detail="Active connectors" />
        <MetricCard title="Marketplace" value={String(providers.length)} detail="Available providers" />
        <MetricCard title="Sync errors" value={String(logs.filter((log) => log.level === 'error').length)} detail="Recent log entries" />
        <MetricCard title="Last sync" value={formatDate(apps.find((app) => app.lastSyncAt)?.lastSyncAt ?? undefined)} detail="Most recent connector run" />
      </MetricGrid>

      <Card>
        <CardHeader>
          <CardTitle>Integrations Marketplace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['all', ...Object.keys(CATEGORY_LABELS)].map((item) => (
              <Button key={item} type="button" variant={category === item ? 'brand' : 'outline'} size="sm" onClick={() => setCategory(item)}>
                {item === 'all' ? 'All' : CATEGORY_LABELS[item]}
              </Button>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {visibleProviders.map((provider) => (
              <button
                key={provider.id}
                type="button"
                className="rounded-md border bg-background p-3 text-left"
                onClick={() => {

                  setProviderId(provider.id);
                  setName(provider.name);
                  setConfig({});
                  setCredentials({});
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{provider.name}</p>
                  <Tag variant={installedProviderIds.has(provider.id) ? 'outline' : 'neutral'}><TagLabel>
                    {installedProviderIds.has(provider.id) ? 'Installed' : CATEGORY_LABELS[provider.category] ?? provider.category}
                  </TagLabel></Tag>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{provider.authType} authentication</p>
                <p className="mt-2 text-xs">{provider.capabilities.slice(0, 4).join(', ')}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Install & Configure Connector</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submitInstall}>
            <div className="grid gap-3 md:grid-cols-2">
              <Select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={providerId}
                onChange={(event) => {
                  const provider = providers.find((item) => item.id === event.target.value);
                  setProviderId(event.target.value);
                  setName(provider?.name ?? '');
                  setConfig({});
                  setCredentials({});
                }}
              >
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </Select>
              <Input placeholder="Connector name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {fields.map((field) => (
                <Input key={field} placeholder={field} value={config[field] ?? ''} onChange={(event) => setConfig((current) => ({ ...current, [field]: event.target.value }))} />
              ))}
              {credentialFields.map((field) => (
                <Input key={field} placeholder={`${field} (encrypted)`} type="password" value={credentials[field] ?? ''} onChange={(event) => setCredentials((current) => ({ ...current, [field]: event.target.value }))} />
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Select className="rounded-md border bg-background px-3 py-2 text-sm" value={syncSchedule} onChange={(event) => setSyncSchedule(event.target.value)}>
                <option value="manual">Manual</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="realtime">Real-time webhooks</option>
              </Select>
              <Select className="rounded-md border bg-background px-3 py-2 text-sm" value={conflictResolution} onChange={(event) => setConflictResolution(event.target.value)}>
                <option value="provider_wins">Provider wins</option>
                <option value="ordella_wins">Ordella wins</option>
                <option value="manual_review">Manual review</option>
              </Select>
            </div>
            <Button type="submit">Install connector</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Installed Connectors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Connector</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last sync</TableHead>
                <TableHead>Retries</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {apps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <p className="font-medium">{app.name}</p>
                    <p className="text-xs text-muted-foreground">{app.providerName}</p>
                  </TableCell>
                  <TableCell>{CATEGORY_LABELS[app.integrationType] ?? app.integrationType}</TableCell>
                  <TableCell><Tag variant={app.status === 'active' ? 'outline' : 'error'}><TagLabel>{app.status}</TagLabel></Tag></TableCell>
                  <TableCell>{formatDate(app.lastSyncAt ?? undefined)}</TableCell>
                  <TableCell>{app.retryCount}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button type="button" size="sm" variant="outline" onClick={() => void test(app)}>Test</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => void sync(app)} disabled={app.status !== 'active'}>Sync</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => void reconnect(app)} disabled={app.status === 'active'}>Reconnect</Button>
                    <Button type="button" size="sm" variant="error" onClick={() => setDisconnectTarget(app)} disabled={app.status === 'disconnected'}>Uninstall</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Logs & Events</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="font-medium">Logs</p>
            {logs.slice(0, 10).map((log) => (
              <div key={log.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{log.action}</span>
                  <Tag variant={log.level === 'error' ? 'error' : 'outline'}><TagLabel>{log.level}</TagLabel></Tag>
                </div>
                <p className="mt-1 text-muted-foreground">{log.message ?? 'No message'}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(log.createdAt)} {log.durationMs ? `- ${log.durationMs}ms` : ''}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="font-medium">Events</p>
            {events.slice(0, 10).map((event) => (
              <div key={event.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{event.eventType}</span>
                  <Tag variant={event.status === 'failed' ? 'error' : 'outline'}><TagLabel>{event.status}</TagLabel></Tag>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(event.createdAt)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Stack>
  );
}


function schemaList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function compact(values: Record<string, string>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value.trim().length > 0));
}
