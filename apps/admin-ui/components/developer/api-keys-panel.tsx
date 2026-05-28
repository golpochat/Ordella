'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { createApiKey, revokeApiKey, rotateApiKey, type DeveloperApiKey } from '@/lib/api/admin/developer';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/admin-dialog';

const SCOPES = [
  'orders.read',
  'orders.write',
  'products.read',
  'catalog.read',
  'inventory.read',
  'inventory.write',
  'customers.read',
  'customers.write',
  'locations.read',
  'subscriptions.read',
  'webhooks.write',
  'integrations.write',
];

export function ApiKeysPanel({ initialKeys }: { initialKeys: DeveloperApiKey[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>(SCOPES.slice(0, 5));
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(1000);
  const [ipAllowlist, setIpAllowlist] = useState('');
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<DeveloperApiKey | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);

  async function createKey(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const key = await createApiKey(createBrowserApiClient(), {
        name,
        scopes,
        rateLimitPerMinute,
        ipAllowlist: ipAllowlist.split(',').map((ip) => ip.trim()).filter(Boolean),
      });
      setKeys((current) => [key, ...current]);
      setRevealedKey(key.key ?? null);
      setName('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function confirmRevoke() {
    if (!revokeTarget) return;
    setRevokeLoading(true);
    setError(null);
    try {
      const updated = await revokeApiKey(createBrowserApiClient(), revokeTarget.id);
      setKeys((current) => current.map((key) => (key.id === revokeTarget.id ? updated : key)));
      setRevokeTarget(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRevokeLoading(false);
    }
  }

  async function rotate(id: string) {
    const updated = await rotateApiKey(createBrowserApiClient(), id);
    setKeys((current) => current.map((key) => (key.id === id ? updated : key)));
    setRevealedKey(updated.key ?? null);
  }

  return (
  <>
    <ConfirmDialog
      open={!!revokeTarget}
      onOpenChange={(open) => {
        if (!open) setRevokeTarget(null);
      }}
      title={revokeTarget ? `Revoke API key "${revokeTarget.name}"?` : 'Revoke API key?'}
      description="Applications using this key will lose access immediately. This cannot be undone."
      confirmLabel="Revoke"
      loading={revokeLoading}
      onConfirm={confirmRevoke}
    />
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={createKey}>
          <Input placeholder="Key name" value={name} onChange={(event) => setName(event.target.value)} required />
          <Button type="submit">Generate key</Button>
          <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
            <Input
              type="number"
              min={60}
              max={10000}
              value={rateLimitPerMinute}
              onChange={(event) => setRateLimitPerMinute(Number(event.target.value))}
              aria-label="Rate limit per minute"
            />
            <Input
              placeholder="IP allowlist, comma separated"
              value={ipAllowlist}
              onChange={(event) => setIpAllowlist(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            {SCOPES.map((scope) => (
              <label key={scope} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={scopes.includes(scope)}
                  onChange={(event) =>
                    setScopes((current) =>
                      event.target.checked ? [...current, scope] : current.filter((item) => item !== scope),
                    )
                  }
                />
                {scope}
              </label>
            ))}
          </div>
        </form>
        {revealedKey ? (
          <div className="rounded-md border bg-muted/40 p-3">
            <p className="text-sm font-medium">Copy this key now. It will only be shown once.</p>
            <code className="mt-2 block break-all text-sm">{revealedKey}</code>
          </div>
        ) : null}
        {error ? <FormErrorAlert message={error} /> : null}
        <Table>
          <TableHeader sticky>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Scopes</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Limit</TableHead>
              <TableHead>Last used</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody zebra>
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell>
                  <p className="font-medium">{key.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{key.keyPrefix}</p>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p>{key.scopes.join(', ')}</p>
                  {key.ipAllowlist.length ? <p className="mt-1 text-xs text-muted-foreground">IPs: {key.ipAllowlist.join(', ')}</p> : null}
                </TableCell>
                <TableCell>{formatDate(key.createdAt)}</TableCell>
                <TableCell>{key.rateLimitPerMinute}/min</TableCell>
                <TableCell>{formatDate(key.lastUsedAt ?? undefined)}</TableCell>
                <TableCell>
                  <Tag variant={key.isActive ? 'outline' : 'error'}><TagLabel>{key.isActive ? 'Active' : 'Revoked'}</TagLabel></Tag>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button type="button" size="sm" variant="outline" onClick={() => void rotate(key.id)} disabled={!key.isActive}>
                    Rotate
                  </Button>
                  <Button type="button" size="sm" variant="error" onClick={() => setRevokeTarget(key)} disabled={!key.isActive}>
                    Revoke
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
