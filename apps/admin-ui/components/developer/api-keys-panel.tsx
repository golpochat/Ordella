'use client';

import { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { createApiKey, revokeApiKey, rotateApiKey, type DeveloperApiKey } from '@/lib/api/admin/developer';
import { formatDate, getErrorMessage } from '@/lib/utils';

const SCOPES = ['orders.read', 'catalog.read', 'inventory.read', 'customers.read', 'locations.read', 'orders.write'];

export function ApiKeysPanel({ initialKeys }: { initialKeys: DeveloperApiKey[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>(SCOPES.slice(0, 5));
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createKey(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const key = await createApiKey(createBrowserApiClient(), { name, scopes });
      setKeys((current) => [key, ...current]);
      setRevealedKey(key.key ?? null);
      setName('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function revoke(id: string) {
    const updated = await revokeApiKey(createBrowserApiClient(), id);
    setKeys((current) => current.map((key) => (key.id === id ? updated : key)));
  }

  async function rotate(id: string) {
    const updated = await rotateApiKey(createBrowserApiClient(), id);
    setKeys((current) => current.map((key) => (key.id === id ? updated : key)));
    setRevealedKey(updated.key ?? null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={createKey}>
          <Input placeholder="Key name" value={name} onChange={(event) => setName(event.target.value)} required />
          <Button type="submit">Generate key</Button>
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
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Scopes</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last used</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell>
                  <p className="font-medium">{key.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{key.keyPrefix}</p>
                </TableCell>
                <TableCell className="max-w-xs">{key.scopes.join(', ')}</TableCell>
                <TableCell>{formatDate(key.createdAt)}</TableCell>
                <TableCell>{formatDate(key.lastUsedAt ?? undefined)}</TableCell>
                <TableCell>
                  <Badge variant={key.isActive ? 'outline' : 'destructive'}>{key.isActive ? 'Active' : 'Revoked'}</Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button type="button" size="sm" variant="outline" onClick={() => void rotate(key.id)} disabled={!key.isActive}>
                    Rotate
                  </Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => void revoke(key.id)} disabled={!key.isActive}>
                    Revoke
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
