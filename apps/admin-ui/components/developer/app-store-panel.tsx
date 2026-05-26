'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  installIntegrationApp,
  uninstallIntegrationApp,
  updateIntegrationApp,
  type DeveloperIntegrationApp,
  type DeveloperIntegrationProvider,
} from '@/lib/api/admin/developer';
import { formatDate, getErrorMessage } from '@/lib/utils';

export function AppStorePanel({
  initialProviders,
  initialApps,
}: {
  initialProviders: DeveloperIntegrationProvider[];
  initialApps: DeveloperIntegrationApp[];
}) {
  const [apps, setApps] = useState(initialApps);
  const [selectedProviderId, setSelectedProviderId] = useState(initialProviders[0]?.id ?? '');
  const [name, setName] = useState(initialProviders[0]?.name ?? '');
  const [configJson, setConfigJson] = useState('{}');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const installedProviderIds = useMemo(() => new Set(apps.filter((app) => app.status !== 'disconnected').map((app) => app.providerId)), [apps]);

  async function install(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const config = JSON.parse(configJson) as Record<string, unknown>;
      const app = await installIntegrationApp(createBrowserApiClient(), { providerId: selectedProviderId, name, config });
      setApps((current) => [app, ...current.filter((item) => item.id !== app.id)]);
      setMessage(`${app.providerName} installed`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function disconnect(id: string) {
    setError(null);
    try {
      await uninstallIntegrationApp(createBrowserApiClient(), id);
      setApps((current) => current.map((app) => (app.id === id ? { ...app, status: 'disconnected' } : app)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function reactivate(app: DeveloperIntegrationApp) {
    setError(null);
    try {
      const updated = await updateIntegrationApp(createBrowserApiClient(), app.id, { status: 'active', config: app.config });
      setApps((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>App Store</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={install}>
          <select
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
          </select>
          <Input placeholder="Integration name" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input placeholder='Config JSON, e.g. {"measurementId":"G-..."}' value={configJson} onChange={(event) => setConfigJson(event.target.value)} />
          <Button type="submit">Install app</Button>
        </form>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {initialProviders.map((provider) => (
            <div key={provider.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{provider.name}</p>
                <Badge variant={installedProviderIds.has(provider.id) ? 'outline' : 'secondary'}>
                  {installedProviderIds.has(provider.id) ? 'Installed' : provider.category}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{provider.slug}</p>
            </div>
          ))}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>App</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Connected</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <p className="font-medium">{app.name}</p>
                  <p className="text-xs text-muted-foreground">{app.providerName}</p>
                </TableCell>
                <TableCell>{app.providerCategory}</TableCell>
                <TableCell>
                  <Badge variant={app.status === 'active' ? 'outline' : 'secondary'}>{app.status}</Badge>
                </TableCell>
                <TableCell>{formatDate(app.connectedAt ?? undefined)}</TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button type="button" size="sm" variant="outline" onClick={() => void reactivate(app)} disabled={app.status === 'active'}>
                    Reconnect
                  </Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => void disconnect(app.id)} disabled={app.status === 'disconnected'}>
                    Uninstall
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
