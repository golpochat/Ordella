'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, Input , Stack } from '@shared-ui';
import {
  AdminTableShell,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/admin-table';
import { createBrowserApiClient } from '@/lib/api/browser';
import { updateSupplier } from '@/lib/api/admin/procurement';
import {
  getSupplierPortalOverview,
  sendSupplierPortalMessage,
  type SupplierPortalOverview,
} from '@/lib/api/admin/supplier-portal';
import { getErrorMessage } from '@/lib/utils';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';

export function SupplierPortalPanel() {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [overview, setOverview] = useState<SupplierPortalOverview | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [portalEmail, setPortalEmail] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const next = await getSupplierPortalOverview(api);
      setOverview(next);
      if (!selectedSupplierId && next.suppliers[0]) {
        setSelectedSupplierId(next.suppliers[0].id);
        setPortalEmail(next.suppliers[0].portalUserEmail ?? '');
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [api, selectedSupplierId]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedSupplier = overview?.suppliers.find((supplier) => supplier.id === selectedSupplierId);

  const selectSupplier = (supplierId: string) => {
    const supplier = overview?.suppliers.find((row) => row.id === supplierId);
    setSelectedSupplierId(supplierId);
    setPortalEmail(supplier?.portalUserEmail ?? '');
    setPortalPassword('');
  };

  const savePortalAccess = async () => {
    if (!selectedSupplier) return;
    try {
      await updateSupplier(api, {
        id: selectedSupplier.id,
        name: selectedSupplier.name,
        contactName: selectedSupplier.contactName ?? undefined,
        email: selectedSupplier.email ?? undefined,
        phone: selectedSupplier.phone ?? undefined,
        address: selectedSupplier.address ?? undefined,
        notes: selectedSupplier.notes ?? undefined,
        isActive: selectedSupplier.isActive,
        portalUserEmail: portalEmail || undefined,
        portalPassword: portalPassword || undefined,
        items: selectedSupplier.items.map((item) => ({
          itemId: item.itemId,
          costPrice: Number(item.costPrice),
          sku: item.sku ?? undefined,
          leadTimeDays: item.leadTimeDays,
          minOrderQty: item.minOrderQty,
        })),
      });
      setPortalPassword('');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const sendMessage = async () => {
    if (!selectedSupplier || !message.trim()) return;
    try {
      await sendSupplierPortalMessage(api, selectedSupplier.id, { message });
      setMessage('');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const performance = overview?.performance ?? [];
  const messages = overview?.messages ?? [];

  return (
    <Stack gap="lg" className="min-w-0">
      {error ? <FormErrorAlert message={error} /> : null}
      <MetricGrid columns={4}>
        <MetricCard label="Portal suppliers" value={overview?.suppliers.filter((supplier) => supplier.portalEnabled).length ?? 0} />
        <MetricCard label="Confirmations" value={overview?.confirmations.length ?? 0} />
        <MetricCard label="Messages" value={messages.length} />
        <MetricCard label="On-time rate" value={`${average(performance.map((row) => row.onTimeDeliveryRate))}%`} />
      </MetricGrid>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <h2 className="text-lg font-semibold">Portal access</h2>
            <p className="text-sm text-muted-foreground">
              Enable supplier login, set the portal email, or reset a supplier password.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={selectedSupplierId} onChange={(event) => selectSupplier(event.target.value)}>
              {(overview?.suppliers ?? []).map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </Select>
            <Input placeholder="Portal login email" value={portalEmail} onChange={(event) => setPortalEmail(event.target.value)} />
            <Input placeholder="Reset password" type="password" value={portalPassword} onChange={(event) => setPortalPassword(event.target.value)} />
          </div>
          <Button type="button" onClick={savePortalAccess} disabled={!selectedSupplier || !portalEmail}>
            Save portal access
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="text-lg font-semibold">Supplier performance</h2>
            <AdminTableShell
              isEmpty={performance.length === 0}
              emptyTitle="No performance data"
              emptyDescription="Supplier performance metrics will appear here."
            >
              <Table>
                <TableHeader sticky>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Portal</TableHead>
                    <TableHead>On-time</TableHead>
                    <TableHead>Avg lead</TableHead>
                    <TableHead>Rejections</TableHead>
                    <TableHead>Shipped</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody zebra>
                  {performance.map((row) => (
                    <TableRow key={row.supplierId}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>
                        <Tag variant={row.portalEnabled ? 'brand' : 'neutral'}><TagLabel>
                          {row.portalEnabled ? 'Enabled' : 'Off'}
                        </TagLabel></Tag>
                      </TableCell>
                      <TableCell>{row.onTimeDeliveryRate}%</TableCell>
                      <TableCell>{row.averageLeadTimeDays ?? 0}d</TableCell>
                      <TableCell>{row.rejectionRate ?? 0}%</TableCell>
                      <TableCell>{row.shippedOrders ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AdminTableShell>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <div className="flex gap-2">
              <Input placeholder="Message selected supplier" value={message} onChange={(event) => setMessage(event.target.value)} />
              <Button type="button" onClick={sendMessage} disabled={!selectedSupplier || !message.trim()}>Send</Button>
            </div>
            <div className="space-y-3">
              {messages.slice(0, 12).map((row) => (
                <div key={row.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{row.supplier?.name ?? row.supplierId}</span>
                    <Tag variant={row.senderType === 'merchant' ? 'neutral' : 'brand'}><TagLabel>{row.senderType}</TagLabel></Tag>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{row.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Stack>
  );
}


function average(values: number[]) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}
