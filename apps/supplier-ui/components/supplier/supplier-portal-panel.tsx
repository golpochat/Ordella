'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent, Input } from '@shared-ui';
import { createBrowserApiClient, browserTokenStorage } from '@/lib/api/browser';
import {
  confirmPurchaseOrder,
  getDashboard,
  getProfile,
  listCatalog,
  listMessages,
  listPurchaseOrders,
  loginSupplier,
  markPurchaseOrderShipped,
  rejectPurchaseOrder,
  sendMessage,
  updateCatalogItem,
  uploadDeliveryDocuments,
  updatePassword,
  updateProfile,
  updatePurchaseOrderDelivery,
  type SupplierCatalogItem,
  type SupplierDashboard,
  type SupplierMessage,
  type SupplierProfile,
  type SupplierPurchaseOrder,
} from '@/lib/api/supplier-portal';
import { formatDate, formatMoney, getErrorMessage } from '@/lib/utils';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { SupplierPortalShell } from '../layout/supplier-portal-shell';

type Section = 'dashboard' | 'purchase-orders' | 'catalog' | 'messages' | 'profile';

type DeliveryDocumentDraft = {
  name: string;
  url: string;
  contentType?: string;
  sizeBytes?: number;
};

type PortalState = {
  dashboard: SupplierDashboard | null;
  profile: SupplierProfile | null;
  purchaseOrders: SupplierPurchaseOrder[];
  catalog: SupplierCatalogItem[];
  messages: SupplierMessage[];
};

const emptyState: PortalState = {
  dashboard: null,
  profile: null,
  purchaseOrders: [],
  catalog: [],
  messages: [],
};

export function SupplierPortalPanel({ section }: { section: Section }) {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [isAuthed, setIsAuthed] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [state, setState] = useState<PortalState>(emptyState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthed(Boolean(browserTokenStorage.getAccessToken()));
    setTenantId(browserTokenStorage.getTenantId() ?? '');
  }, []);

  const load = useCallback(async () => {
    if (!browserTokenStorage.getAccessToken()) return;
    try {
      const [dashboard, profile, purchaseOrders, catalog, messages] = await Promise.all([
        getDashboard(api),
        getProfile(api),
        listPurchaseOrders(api),
        listCatalog(api),
        listMessages(api),
      ]);
      setState({ dashboard, profile, purchaseOrders, catalog, messages });
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [api]);

  useEffect(() => {
    if (isAuthed) void load();
  }, [isAuthed, load]);

  const login = async () => {
    try {
      browserTokenStorage.setTenantId(tenantId.trim());
      const session = await loginSupplier(api, { email: loginEmail, password: loginPassword });
      browserTokenStorage.setAccessToken(session.accessToken);
      setIsAuthed(true);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const signOut = () => {
    browserTokenStorage.clear();
    setIsAuthed(false);
    setState(emptyState);
  };

  if (!isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 p-6">
            <div>
              <h1 className="text-2xl font-semibold">Supplier Portal</h1>
              <p className="text-sm text-muted-foreground">
                Sign in to manage purchase orders, catalog costs, delivery dates, and merchant messages.
              </p>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Input placeholder="Tenant ID" value={tenantId} onChange={(event) => setTenantId(event.target.value)} />
            <Input placeholder="Email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} />
            <Input
              placeholder="Password"
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
            />
            <Button type="button" className="w-full" onClick={login} disabled={!tenantId || !loginEmail || !loginPassword}>
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SupplierPortalShell onSignOut={signOut}>
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      {section === 'dashboard' ? <DashboardView dashboard={state.dashboard} /> : null}
      {section === 'purchase-orders' ? <PurchaseOrdersView orders={state.purchaseOrders} onChanged={load} /> : null}
      {section === 'catalog' ? <CatalogView catalog={state.catalog} onChanged={load} /> : null}
      {section === 'messages' ? (
        <MessagesView messages={state.messages} orders={state.purchaseOrders} onChanged={load} />
      ) : null}
      {section === 'profile' ? <ProfileView profile={state.profile} onChanged={load} /> : null}
    </SupplierPortalShell>
  );
}

function DashboardView({ dashboard }: { dashboard: SupplierDashboard | null }) {
  if (!dashboard) return <p className="text-sm text-muted-foreground">Loading dashboard...</p>;
  const metrics = dashboard.metrics;
  const cards = [
    ['Pending POs', metrics.pendingPOs],
    ['Confirmed POs', metrics.confirmedPOs],
    ['Shipped POs', metrics.shippedPOs],
    ['Delivery ETA', metrics.nextDeliveryEta ?? 'No open ETA'],
    ['On-time delivery', `${metrics.onTimeDeliveryRate}%`],
    ['Fill rate', `${metrics.fillRate}%`],
    ['Avg confirmation', `${metrics.averageConfirmationHours}h`],
    ['Messages', metrics.unreadMessages],
  ];
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Supplier dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Welcome back, {dashboard.profile.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Track pending, confirmed, and shipped purchase orders with delivery performance at a glance.
            </p>
          </div>
          <Badge variant={metrics.rejectedPOs ? 'destructive' : 'secondary'}>
            {metrics.rejectedPOs} rejected
          </Badge>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <Card key={label} className="overflow-hidden">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent className="space-y-4 p-4">
            <SectionHeader title="Recent purchase orders" description="Newest POs that need confirmation, shipment, or delivery updates." />
            <PurchaseOrderTable orders={dashboard.recentPurchaseOrders} compact />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-4">
            <SectionHeader title="Recent notes" description="Latest tenant and supplier messages." />
            {dashboard.recentMessages.map((message) => (
              <div key={message.id} className="rounded-xl border bg-background p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={message.senderType === 'supplier' ? 'secondary' : 'default'}>{message.senderType}</Badge>
                  <span className="text-xs text-muted-foreground">{message.createdAt.slice(0, 10)}</span>
                </div>
                <p className="mt-2 text-muted-foreground">{message.message}</p>
              </div>
            ))}
            {!dashboard.recentMessages.length ? <p className="text-sm text-muted-foreground">No recent messages.</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PurchaseOrdersView({ orders, onChanged }: { orders: SupplierPurchaseOrder[]; onChanged: () => Promise<void> }) {
  const { settings } = useTenantSettings();
  const api = useMemo(() => createBrowserApiClient(), []);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [dates, setDates] = useState<Record<string, string>>({});
  const [documentDrafts, setDocumentDrafts] = useState<Record<string, DeliveryDocumentDraft>>({});
  const [error, setError] = useState<string | null>(null);

  const action = async (order: SupplierPurchaseOrder, type: 'confirm' | 'reject' | 'delivery' | 'ship') => {
    try {
      const body = {
        purchaseOrderId: order.id,
        notes: notes[order.id] || undefined,
        expectedDeliveryDate: dates[order.id] || order.supplierExpectedDeliveryDate || order.expectedDeliveryDate || undefined,
      };
      if (type === 'confirm') await confirmPurchaseOrder(api, body);
      if (type === 'reject') await rejectPurchaseOrder(api, body);
      if (type === 'delivery') await updatePurchaseOrderDelivery(api, body);
      if (type === 'ship') await markPurchaseOrderShipped(api, body);
      setError(null);
      await onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const setDocumentDraft = (orderId: string, draft: Partial<DeliveryDocumentDraft>) => {
    setDocumentDrafts((current) => ({
      ...current,
      [orderId]: {
        name: current[orderId]?.name ?? '',
        url: current[orderId]?.url ?? '',
        contentType: current[orderId]?.contentType,
        sizeBytes: current[orderId]?.sizeBytes,
        ...draft,
      },
    }));
  };

  const readDocumentFile = (orderId: string, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDocumentDraft(orderId, {
        name: file.name,
        url: String(reader.result ?? ''),
        contentType: file.type,
        sizeBytes: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const uploadDocuments = async (order: SupplierPurchaseOrder) => {
    const draft = documentDrafts[order.id];
    if (!draft?.name || !draft.url) return;
    try {
      await uploadDeliveryDocuments(api, {
        purchaseOrderId: order.id,
        documents: [draft],
      });
      setDocumentDrafts((current) => ({ ...current, [order.id]: { name: '', url: '' } }));
      setError(null);
      await onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Purchase Orders" description="Confirm, reject, ship, propose delivery dates, and upload delivery documents." />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Purchase order</p>
                  <h2 className="text-xl font-semibold">PO {order.id.slice(0, 8)}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{order.location?.name ?? 'Location'}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Badge>{order.supplierStatus}</Badge>
                  <Badge variant="outline">{order.status}</Badge>
                </div>
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-3">
                <InfoTile label="Net" value={formatMoney(order.subtotalCost ?? order.totalCost, settings)} />
                <InfoTile label="Tax" value={formatMoney(order.taxTotal ?? '0.00', settings)} />
                <InfoTile label="Gross" value={formatMoney(order.totalCost, settings)} />
                <InfoTile label="Expected" value={formatDate(order.expectedDeliveryDate, settings)} />
                <InfoTile label="Supplier ETA" value={formatDate(order.supplierExpectedDeliveryDate, settings)} />
                <InfoTile label="Shipped" value={formatDate(order.shippedAt, settings)} />
              </div>
              <PurchaseOrderLines order={order} />
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  type="date"
                  value={dates[order.id] ?? order.supplierExpectedDeliveryDate ?? order.expectedDeliveryDate ?? ''}
                  onChange={(event) => setDates((current) => ({ ...current, [order.id]: event.target.value }))}
                />
                <Input
                  placeholder="Supplier notes"
                  value={notes[order.id] ?? order.supplierNotes ?? ''}
                  onChange={(event) => setNotes((current) => ({ ...current, [order.id]: event.target.value }))}
                />
              </div>
              <div className="rounded-xl border bg-muted/20 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">Delivery documents</p>
                  <Badge variant="secondary">{order.deliveryDocuments.length} uploaded</Badge>
                </div>
                {order.deliveryDocuments.length ? (
                  <div className="mt-3 space-y-2">
                    {order.deliveryDocuments.map((document) => (
                      <a key={`${document.name}-${document.uploadedAt}`} className="block truncate text-sm text-primary hover:underline" href={document.url} target="_blank" rel="noreferrer">
                        {document.name}
                      </a>
                    ))}
                  </div>
                ) : null}
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <Input
                    placeholder="Document name"
                    value={documentDrafts[order.id]?.name ?? ''}
                    onChange={(event) => setDocumentDraft(order.id, { name: event.target.value })}
                  />
                  <Input
                    placeholder="Document URL"
                    value={documentDrafts[order.id]?.url ?? ''}
                    onChange={(event) => setDocumentDraft(order.id, { url: event.target.value })}
                  />
                  <input
                    className="rounded-md border bg-background px-3 py-2 text-sm md:col-span-2"
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(event) => readDocumentFile(order.id, event.target.files?.[0])}
                  />
                </div>
                <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => void uploadDocuments(order)} disabled={!documentDrafts[order.id]?.name || !documentDrafts[order.id]?.url}>
                  Upload document
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => void action(order, 'confirm')}>Confirm</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => void action(order, 'delivery')}>Propose delivery date</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => void action(order, 'ship')}>Mark shipped</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => void action(order, 'reject')}>Reject</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CatalogView({ catalog, onChanged }: { catalog: SupplierCatalogItem[]; onChanged: () => Promise<void> }) {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [drafts, setDrafts] = useState<Record<string, SupplierCatalogItem>>({});
  const [error, setError] = useState<string | null>(null);

  const save = async (item: SupplierCatalogItem) => {
    const draft = drafts[item.id] ?? item;
    try {
      await updateCatalogItem(api, {
        supplierItemId: item.id,
        costPrice: Number(draft.costPrice),
        leadTimeDays: draft.leadTimeDays,
        minOrderQty: draft.minOrderQty,
        caseSize: draft.caseSize,
        sku: draft.sku ?? undefined,
      });
      setError(null);
      await onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Catalog" description="Keep supplier costs, lead times, SKUs, and minimum order quantities current." />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Item</th>
              <th className="p-3 font-medium">Cost</th>
              <th className="p-3 font-medium">Lead days</th>
              <th className="p-3 font-medium">Min order</th>
              <th className="p-3 font-medium">Case size</th>
              <th className="p-3 font-medium">SKU</th>
              <th className="p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {catalog.map((item) => {
              const draft = drafts[item.id] ?? item;
              return (
                <tr key={item.id} className="border-t">
                  <td className="p-3 font-medium">{item.item?.name ?? item.itemId}</td>
                  <td className="p-3">
                    <Input value={draft.costPrice} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { ...draft, costPrice: event.target.value } }))} />
                  </td>
                  <td className="p-3">
                    <Input type="number" value={draft.leadTimeDays} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { ...draft, leadTimeDays: Number(event.target.value) } }))} />
                  </td>
                  <td className="p-3">
                    <Input type="number" value={draft.minOrderQty} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { ...draft, minOrderQty: Number(event.target.value) } }))} />
                  </td>
                  <td className="p-3">
                    <Input type="number" value={draft.caseSize} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { ...draft, caseSize: Number(event.target.value) } }))} />
                  </td>
                  <td className="p-3">
                    <Input value={draft.sku ?? ''} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { ...draft, sku: event.target.value } }))} />
                  </td>
                  <td className="p-3">
                    <Button type="button" size="sm" onClick={() => void save(item)}>Save</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MessagesView({
  messages,
  orders,
  onChanged,
}: {
  messages: SupplierMessage[];
  orders: SupplierPurchaseOrder[];
  onChanged: () => Promise<void>;
}) {
  const { settings } = useTenantSettings();
  const api = useMemo(() => createBrowserApiClient(), []);
  const [message, setMessage] = useState('');
  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    try {
      await sendMessage(api, { message, purchaseOrderId: purchaseOrderId || undefined });
      setMessage('');
      setError(null);
      await onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Messages" description="Chat with the merchant and link conversations to purchase orders." />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Card>
        <CardContent className="space-y-3 p-4">
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={purchaseOrderId} onChange={(event) => setPurchaseOrderId(event.target.value)}>
            <option value="">General message</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>PO {order.id.slice(0, 8)}</option>
            ))}
          </select>
          <Input placeholder="Write a message" value={message} onChange={(event) => setMessage(event.target.value)} />
          <Button type="button" onClick={submit} disabled={!message.trim()}>Send message</Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {messages.map((row) => (
          <div key={row.id} className={`rounded-lg border p-3 ${row.senderType === 'supplier' ? 'bg-muted/30' : 'bg-card'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant={row.senderType === 'supplier' ? 'secondary' : 'default'}>{row.senderType}</Badge>
              <span className="text-xs text-muted-foreground">{formatDate(row.createdAt, settings)}</span>
            </div>
            <p className="mt-2 text-sm">{row.message}</p>
            {row.purchaseOrderId ? <p className="mt-1 text-xs text-muted-foreground">PO {row.purchaseOrderId.slice(0, 8)}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileView({ profile, onChanged }: { profile: SupplierProfile | null; onChanged: () => Promise<void> }) {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setContactName(profile?.contactName ?? '');
    setEmail(profile?.email ?? '');
    setPhone(profile?.phone ?? '');
  }, [profile]);

  const saveProfile = async () => {
    try {
      await updateProfile(api, { contactName, email, phone });
      setError(null);
      await onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const savePassword = async () => {
    try {
      await updatePassword(api, { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setError(null);
      await onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Profile" description="Update supplier contact information and portal password." />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="font-medium">{profile?.name ?? 'Supplier'}</p>
          <Input placeholder="Contact name" value={contactName} onChange={(event) => setContactName(event.target.value)} />
          <Input placeholder="Contact email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input placeholder="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <Button type="button" onClick={saveProfile}>Save profile</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="font-medium">Password</p>
          <Input type="password" placeholder="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          <Input type="password" placeholder="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          <Button type="button" onClick={savePassword} disabled={!currentPassword || newPassword.length < 8}>Update password</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PurchaseOrderTable({ orders, compact = false }: { orders: SupplierPurchaseOrder[]; compact?: boolean }) {
  const { settings } = useTenantSettings();
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-3 font-medium">PO</th>
            <th className="p-3 font-medium">Location</th>
            <th className="p-3 font-medium">Supplier status</th>
            <th className="p-3 font-medium">Due</th>
            <th className="p-3 font-medium">Net</th>
            <th className="p-3 font-medium">Tax</th>
            <th className="p-3 font-medium">Gross</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t">
              <td className="p-3 font-medium">{order.id.slice(0, 8)}</td>
              <td className="p-3">{order.location?.name ?? 'Location'}</td>
              <td className="p-3"><Badge>{order.supplierStatus}</Badge></td>
              <td className="p-3">{formatDate(order.expectedDeliveryDate, settings)}</td>
              <td className="p-3">{formatMoney(order.subtotalCost ?? order.totalCost, settings)}</td>
              <td className="p-3">{formatMoney(order.taxTotal ?? '0.00', settings)}</td>
              <td className="p-3">{formatMoney(order.totalCost, settings)}</td>
            </tr>
          ))}
          {!orders.length ? (
            <tr>
              <td className="p-3 text-muted-foreground" colSpan={7}>
                {compact ? 'No recent purchase orders.' : 'No purchase orders assigned yet.'}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function PurchaseOrderLines({ order }: { order: SupplierPurchaseOrder }) {
  const { settings } = useTenantSettings();
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-xs">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-2 font-medium">Item</th>
            <th className="p-2 font-medium">Ordered</th>
            <th className="p-2 font-medium">Received</th>
            <th className="p-2 font-medium">Cost</th>
            <th className="p-2 font-medium">Tax</th>
            <th className="p-2 font-medium">Line total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-2">{item.item?.name ?? item.itemId}</td>
              <td className="p-2">{item.quantityOrdered}</td>
              <td className="p-2">{item.quantityReceived}</td>
              <td className="p-2">{formatMoney(item.costPrice, settings)}</td>
              <td className="p-2">{formatMoney(item.taxAmount ?? '0.00', settings)} ({Number(item.taxRate ?? 0).toFixed(2)}%)</td>
              <td className="p-2">{formatMoney(Number(item.costPrice) * item.quantityOrdered, settings)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
