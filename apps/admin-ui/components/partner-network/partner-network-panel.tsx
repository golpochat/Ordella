'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { approvePartnerApplication, type PartnerApplication, type PartnerMarketplaceCategory, type PartnerMarketplaceItem } from '@/lib/api/admin/partner-network';
import { getErrorMessage } from '@/lib/utils';

export function PartnerNetworkPanel({
  initialApplications,
  initialCategories,
  initialItems,
}: {
  initialApplications: PartnerApplication[];
  initialCategories: PartnerMarketplaceCategory[];
  initialItems: PartnerMarketplaceItem[];
}) {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [applications, setApplications] = useState(initialApplications);
  const [categories] = useState(initialCategories);
  const [items] = useState(initialItems);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('submitted');

  const visibleApplications = useMemo(() => {
    return statusFilter ? applications.filter((a) => a.status === statusFilter) : applications;
  }, [applications, statusFilter]);

  async function decideApplication(application: PartnerApplication, status: 'approved' | 'rejected') {
    setError(null);
    setMessage(null);
    try {
      const updated = await approvePartnerApplication(api, application.id, { status });
      setApplications((current) => current.map((a) => (a.id === updated.id ? updated : a)));
      setMessage(`Application ${status}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      {message ? <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm">{message}</p> : null}
      {error ? <p className="rounded-md border border-destructive px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Partner Onboarding Applications</CardTitle>
            <div className="flex items-center gap-2">
              <Input value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-[180px]" placeholder="status (submitted|approved|rejected)" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-[260px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleApplications.length ? (
                visibleApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-xs">{app.id}</TableCell>
                    <TableCell className="font-mono text-xs">{app.appPartnerId}</TableCell>
                    <TableCell>
                      <Badge variant={app.status === 'approved' ? 'outline' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(app.submittedAt).toLocaleString()}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => decideApplication(app, 'approved')} disabled={app.status !== 'submitted'}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => decideApplication(app, 'rejected')} disabled={app.status !== 'submitted'}>
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No applications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Marketplace Expansion (MVP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Badge key={c.id} variant="secondary">
                {c.displayName}
              </Badge>
            ))}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Regions</TableHead>
                <TableHead>Partner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.slice(0, 20).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-sm">{item.itemType}</TableCell>
                  <TableCell className="text-sm">{(item.regionCodes ?? []).join(', ') || 'Global'}</TableCell>
                  <TableCell className="font-mono text-xs">{item.appPartnerId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length > 20 ? <p className="text-xs text-muted-foreground">Showing first 20 items.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

