'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { updateSupplier } from '@/lib/api/admin/procurement';
import {
  getSupplierPortalOverview,
  sendSupplierPortalMessage,
  type SupplierPortalOverview,
} from '@/lib/api/admin/supplier-portal';
import { getErrorMessage } from '@/lib/utils';

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
    <div className="space-y-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Portal suppliers" value={overview?.suppliers.filter((supplier) => supplier.portalEnabled).length ?? 0} />
        <MetricCard label="Confirmations" value={overview?.confirmations.length ?? 0} />
        <MetricCard label="Messages" value={messages.length} />
        <MetricCard label="Avg fill rate" value={`${average(performance.map((row) => row.fillRate))}%`} />
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <h2 className="text-lg font-semibold">Portal access</h2>
            <p className="text-sm text-muted-foreground">
              Enable supplier login, set the portal email, or reset a supplier password.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={selectedSupplierId} onChange={(event) => selectSupplier(event.target.value)}>
              {(overview?.suppliers ?? []).map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
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
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="p-3 font-medium">Supplier</th>
                    <th className="p-3 font-medium">Portal</th>
                    <th className="p-3 font-medium">Confirmations</th>
                    <th className="p-3 font-medium">Delays</th>
                    <th className="p-3 font-medium">Fill rate</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map((row) => (
                    <tr key={row.supplierId} className="border-t">
                      <td className="p-3 font-medium">{row.name}</td>
                      <td className="p-3"><Badge variant={row.portalEnabled ? 'default' : 'secondary'}>{row.portalEnabled ? 'Enabled' : 'Off'}</Badge></td>
                      <td className="p-3">{row.confirmations}</td>
                      <td className="p-3">{row.delays}</td>
                      <td className="p-3">{row.fillRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                    <Badge variant={row.senderType === 'merchant' ? 'secondary' : 'default'}>{row.senderType}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{row.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}
