'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  installIntegrationApp,
  uninstallIntegrationApp,
  updateIntegrationApp,
  type DeveloperIntegrationApp,
  type DeveloperIntegrationProvider,
} from '@/lib/api/admin/developer';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { IrreversibleConfirmDialog } from '@/components/ui/admin-dialog';

export function AppStorePanel({
  initialProviders,
  initialApps,
}: {
  initialProviders: DeveloperIntegrationProvider[];
  initialApps: DeveloperIntegrationApp[];
}) {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const [apps, setApps] = useState(initialApps);
  const [selectedProviderId, setSelectedProviderId] = useState(initialProviders[0]?.id ?? '');
  const [name, setName] = useState(initialProviders[0]?.name ?? '');
  const [configJson, setConfigJson] = useState('{}');
  const [disconnectTarget, setDisconnectTarget] = useState<DeveloperIntegrationApp | null>(null);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
    const installedProviderIds = useMemo(() => new Set(apps.filter((app) => app.status !== 'disconnected').map((app) => app.providerId)), [apps]);

  async function install(event: React.FormEvent) {
    event.preventDefault();
    try {
      const config = JSON.parse(configJson) as Record<string, unknown>;
      const app = await installIntegrationApp(createBrowserApiClient(), { providerId: selectedProviderId, name, config });
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
      await uninstallIntegrationApp(createBrowserApiClient(), disconnectTarget.id);
      setApps((current) => current.map((app) => (app.id === disconnectTarget.id ? { ...app, status: 'disconnected' } : app)));
      setDisconnectTarget(null);
      toastSuccess('Integration disconnected');
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setDisconnectLoading(false);
    }
  }

  async function reactivate(app: DeveloperIntegrationApp) {
    try {
      const updated = await updateIntegrationApp(createBrowserApiClient(), app.id, { status: 'active', config: app.config });
      setApps((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  return (
  <>
    <IrreversibleConfirmDialog
      open={!!disconnectTarget}
      onOpenChange={(open) => {
        if (!open) setDisconnectTarget(null);
      }}
      title={disconnectTarget ? `Disconnect ${disconnectTarget.name}?` : 'Disconnect integration?'}
      description="API access for this integration will stop until you install it again."
      confirmLabel="Disconnect"
      loading={disconnectLoading}
      onConfirm={confirmDisconnect}
    />
    <Card>
      <CardHeader>
        <CardTitle>App Store</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={install}>
          <Select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={selectedProviderId}
            onChange={(event) => {

              const provider = initialProviders.find((item) => item.id === event.target.value);
              setSelectedProviderId(event.target.value);
              setName(provider?.name ?? '');
            }}
            required
          >
            {initialProviders.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name} ({provider.category})
              </option>
            ))}
          </Select>
          <Input placeholder="Integration name" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input placeholder='Config JSON, e.g. {"measurementId":"G-..."}' value={configJson} onChange={(event) => setConfigJson(event.target.value)} />
          <Button type="submit">Install app</Button>
        </form>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {initialProviders.map((provider) => (
            <div key={provider.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{provider.name}</p>
                <Tag variant={installedProviderIds.has(provider.id) ? 'outline' : 'neutral'}><TagLabel>
                  {installedProviderIds.has(provider.id) ? 'Installed' : provider.category}
                </TagLabel></Tag>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{provider.slug}</p>
            </div>
          ))}
        </div>
        <Table>
          <TableHeader sticky>
            <TableRow>
              <TableHead>App</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Connected</TableHead>
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
                <TableCell>{app.providerCategory}</TableCell>
                <TableCell>
                  <Tag variant={app.status === 'active' ? 'outline' : 'neutral'}><TagLabel>{app.status}</TagLabel></Tag>
                </TableCell>
                <TableCell>{formatDate(app.connectedAt ?? undefined)}</TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button type="button" size="sm" variant="outline" onClick={() => void reactivate(app)} disabled={app.status === 'active'}>
                    Reconnect
                  </Button>
                  <Button type="button" size="sm" variant="error" onClick={() => setDisconnectTarget(app)} disabled={app.status === 'disconnected'}>
                    Uninstall
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </>
  );
}
