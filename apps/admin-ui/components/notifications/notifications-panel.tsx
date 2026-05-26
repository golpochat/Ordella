'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
} from '@shared-ui';
import {
  getTenantNotificationSettings,
  getNotificationPreferences,
  listNotificationLogs,
  listNotificationHistory,
  listNotificationTemplates,
  previewNotificationTemplate,
  saveNotificationTemplate,
  testSendNotificationTemplate,
  updateTenantNotificationSettings,
  updateNotificationPreferences,
  type NotificationHistoryItem,
  type NotificationLog,
  type NotificationPreference,
  type NotificationTemplate,
  type TenantNotificationSettings,
} from '@/lib/api/notifications';
import { getErrorMessage } from '@/lib/utils';
import { useTenantSettings } from '@/hooks/use-tenant-settings';

const CATEGORIES = [
  { key: 'orders', label: 'Orders' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'staff', label: 'Staff' },
  { key: 'customer', label: 'Customer' },
  { key: 'billing', label: 'Billing' },
];

const TEMPLATE_TYPES = [
  'order_confirmation',
  'order_status_preparing',
  'order_ready',
  'order_out_for_delivery',
  'delivery_eta_update',
  'driver_assignment',
  'supplier_po_created',
  'supplier_po_confirmed',
  'supplier_po_rejected',
  'low_stock',
  'forecast_alert',
  'replenishment_suggestion',
] as const;

const CHANNELS = ['email', 'sms', 'push'] as const;

const SAMPLE_VARIABLES = {
  customerName: 'Ava Murphy',
  orderId: 'ord_123',
  orderNumber: '10042',
  total: '42.50',
  formattedTotal: '€42.50',
  status: 'ready',
  eta: new Date().toISOString(),
  formattedEta: 'Today 18:30',
  driverName: 'Sam Driver',
  deliveryTaskId: 'del_123',
  purchaseOrderId: 'po_123',
  supplierName: 'Fresh Foods Ltd',
  itemName: 'Tomatoes',
  stockLevel: '4',
  reorderPoint: '12',
  title: 'Stock-out risk',
  message: 'Tomatoes are forecast to run out in 2 days.',
  itemCount: '6',
  suggestedValue: '€320.00',
};

type TemplateForm = {
  id?: string;
  name: string;
  channel: NotificationTemplate['channel'];
  subject: string;
  text: string;
  html: string;
  isActive: boolean;
  recipient: string;
};

export function NotificationsPanel() {
  const { formatDateTime } = useTenantSettings();
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [settings, setSettings] = useState<TenantNotificationSettings | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [form, setForm] = useState<TemplateForm>({
    name: 'order_confirmation',
    channel: 'email',
    subject: 'Order #{{orderNumber}} confirmed',
    text: 'Thanks {{customerName}}. Your order total is {{formattedTotal}}.',
    html: '<p>Thanks {{customerName}}. Your order total is {{formattedTotal}}.</p>',
    isActive: true,
    recipient: '',
  });
  const [preview, setPreview] = useState<{ subject: string; text: string; html: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const templateByKey = useMemo(
    () => new Map(templates.map((template) => [`${template.name}:${template.channel}`, template])),
    [templates],
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [preferenceData, historyData] = await Promise.all([
        getNotificationPreferences(),
        listNotificationHistory(),
      ]);
      const [settingsData, templateData, logData] = await Promise.all([
        getTenantNotificationSettings(),
        listNotificationTemplates(),
        listNotificationLogs(),
      ]);
      setPreferences(preferenceData);
      setHistory(historyData);
      setSettings(settingsData);
      setTemplates(templateData);
      setLogs(logData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(next: NotificationPreference) {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateNotificationPreferences({
        emailEnabled: next.emailEnabled,
        smsEnabled: next.smsEnabled,
        pushEnabled: next.pushEnabled,
        categories: next.categories,
      });
      setPreferences(updated);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings(next: TenantNotificationSettings) {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateTenantNotificationSettings(next);
      setSettings(updated);
      setMessage('Notification settings saved');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function loadTemplate(name: string, channel: NotificationTemplate['channel']) {
    const existing = templateByKey.get(`${name}:${channel}`);
    setForm({
      id: existing?.id,
      name,
      channel,
      subject: existing?.subject ?? defaultSubject(name),
      text: String(existing?.content.text ?? defaultText(name)),
      html: String(existing?.content.html ?? `<p>${defaultText(name)}</p>`),
      isActive: existing?.isActive ?? true,
      recipient: form.recipient,
    });
    setPreview(null);
  }

  async function saveTemplate() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const saved = await saveNotificationTemplate({
        id: form.id,
        name: form.name,
        channel: form.channel,
        subject: form.subject || null,
        content: { text: form.text, html: form.html },
        isActive: form.isActive,
      });
      setTemplates((current) => [
        saved,
        ...current.filter((template) => template.id !== saved.id && `${template.name}:${template.channel}` !== `${saved.name}:${saved.channel}`),
      ]);
      setForm((current) => ({ ...current, id: saved.id }));
      setMessage('Template saved');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function previewTemplate() {
    try {
      const rendered = await previewNotificationTemplate({
        name: form.name,
        channel: form.channel,
        subject: form.subject || null,
        content: { text: form.text, html: form.html },
        variables: SAMPLE_VARIABLES,
      });
      setPreview(rendered);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function testSend() {
    if (!form.recipient.trim()) {
      setError('Enter a test recipient first');
      return;
    }
    setSaving(true);
    try {
      await testSendNotificationTemplate({
        name: form.name,
        channel: form.channel,
        subject: form.subject || null,
        content: { text: form.text, html: form.html },
        variables: SAMPLE_VARIABLES,
        recipient: form.recipient.trim(),
      });
      setMessage('Test notification sent');
      const [historyData, logData] = await Promise.all([listNotificationHistory(), listNotificationLogs()]);
      setHistory(historyData);
      setLogs(logData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function toggleChannel(key: 'emailEnabled' | 'smsEnabled' | 'pushEnabled') {
    if (!preferences) return;
    void save({ ...preferences, [key]: !preferences[key] });
  }

  function toggleCategory(category: string) {
    if (!preferences) return;
    const categories = preferences.categories.includes(category)
      ? preferences.categories.filter((item) => item !== category)
      : [...preferences.categories, category];
    void save({ ...preferences, categories });
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading notifications…</p>;
  }

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-md border border-destructive p-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="rounded-md border p-3 text-sm text-muted-foreground">{message}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Tenant notification settings</CardTitle>
          <CardDescription>Control tenant-level channel availability and sender identity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings ? (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <ChannelToggle label="Email" enabled={settings.emailEnabled} onClick={() => void saveSettings({ ...settings, emailEnabled: !settings.emailEnabled })} />
                <ChannelToggle label="SMS" enabled={settings.smsEnabled} onClick={() => void saveSettings({ ...settings, smsEnabled: !settings.smsEnabled })} />
                <ChannelToggle label="Push" enabled={settings.pushEnabled} onClick={() => void saveSettings({ ...settings, pushEnabled: !settings.pushEnabled })} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input value={settings.fromName} placeholder="From name" onChange={(event) => setSettings({ ...settings, fromName: event.target.value })} />
                <Input value={settings.fromEmail} placeholder="From email" onChange={(event) => setSettings({ ...settings, fromEmail: event.target.value })} />
              </div>
              <Button type="button" disabled={saving} onClick={() => void saveSettings(settings)}>
                Save sender settings
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User preferences</CardTitle>
          <CardDescription>Choose which channels and categories are enabled for business updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {preferences ? (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <ChannelToggle label="Email" enabled={preferences.emailEnabled} onClick={() => toggleChannel('emailEnabled')} />
                <ChannelToggle label="SMS" enabled={preferences.smsEnabled} onClick={() => toggleChannel('smsEnabled')} />
                <ChannelToggle label="Push" enabled={preferences.pushEnabled} onClick={() => toggleChannel('pushEnabled')} />
              </div>

              <div>
                <p className="text-sm font-medium">Categories</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <Button
                      key={category.key}
                      type="button"
                      variant={preferences.categories.includes(category.key) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleCategory(category.key)}
                      disabled={saving}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template editor</CardTitle>
          <CardDescription>Use variables like {'{{customerName}}'}, {'{{orderId}}'}, {'{{total}}'}, {'{{formattedTotal}}'}, {'{{formattedEta}}'}, and {'{{supplierName}}'}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.name} onChange={(event) => loadTemplate(event.target.value, form.channel)}>
              {TEMPLATE_TYPES.map((type) => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.channel} onChange={(event) => loadTemplate(form.name, event.target.value as NotificationTemplate['channel'])}>
              {CHANNELS.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
              Active
            </label>
          </div>
          <Input value={form.subject} placeholder="Subject" onChange={(event) => setForm({ ...form, subject: event.target.value })} />
          <textarea className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.text} placeholder="Plain text body" onChange={(event) => setForm({ ...form, text: event.target.value })} />
          <textarea className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.html} placeholder="HTML body" onChange={(event) => setForm({ ...form, html: event.target.value })} />
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <Input value={form.recipient} placeholder="Test recipient email, phone, or push token" onChange={(event) => setForm({ ...form, recipient: event.target.value })} />
            <Button type="button" variant="outline" onClick={() => void previewTemplate()}>Preview</Button>
            <Button type="button" variant="outline" disabled={saving} onClick={() => void testSend()}>Test send</Button>
            <Button type="button" disabled={saving} onClick={() => void saveTemplate()}>Save template</Button>
          </div>
          {preview ? (
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">{preview.subject}</p>
              <p className="mt-2 text-muted-foreground">{preview.text}</p>
              <div className="mt-2 rounded bg-muted p-2 text-xs">{preview.html}</div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>Configured tenant templates by event and channel.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.channel}</TableCell>
                  <TableCell>{template.version}</TableCell>
                  <TableCell><Badge variant={template.isActive ? 'default' : 'secondary'}>{template.isActive ? 'active' : 'inactive'}</Badge></TableCell>
                  <TableCell><Button type="button" size="sm" variant="outline" onClick={() => loadTemplate(template.name, template.channel)}>Edit</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!templates.length ? <p className="py-6 text-center text-sm text-muted-foreground">No custom templates yet. Defaults will be used until you save one.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification logs</CardTitle>
          <CardDescription>Delivery attempts across sent, delivered, and failed statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Notification</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell><Badge variant={log.status === 'failed' ? 'destructive' : 'secondary'}>{log.status}</Badge></TableCell>
                  <TableCell>{log.notificationId.slice(0, 8)}</TableCell>
                  <TableCell>{String(log.providerResponse.provider ?? log.providerResponse.status ?? '-')}</TableCell>
                  <TableCell>{log.errorMessage ?? '-'}</TableCell>
                  <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!logs.length ? <p className="py-6 text-center text-sm text-muted-foreground">No delivery logs yet.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Recent notification records.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.type}</TableCell>
                  <TableCell>{item.channel}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'failed' ? 'destructive' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.recipient ?? 'Dashboard'}</TableCell>
                  <TableCell>{formatDateTime(item.sentAt ?? item.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {history.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function defaultSubject(name: string) {
  if (name.includes('order')) return 'Order #{{orderNumber}} update';
  if (name.includes('supplier')) return 'Purchase order {{purchaseOrderId}} update';
  if (name.includes('stock')) return 'Low stock alert: {{itemName}}';
  if (name.includes('forecast')) return 'Forecast alert: {{title}}';
  return 'Ordella notification';
}

function defaultText(name: string) {
  if (name.includes('delivery')) return 'Delivery update for order #{{orderNumber}}. ETA: {{formattedEta}}.';
  if (name.includes('supplier')) return 'Purchase order {{purchaseOrderId}} changed for {{supplierName}}.';
  if (name.includes('stock')) return '{{itemName}} is at {{stockLevel}} units. Reorder point is {{reorderPoint}}.';
  if (name.includes('replenishment')) return '{{itemCount}} replenishment suggestions are ready.';
  return 'Hello {{customerName}}, this is an Ordella update.';
}

function ChannelToggle({
  label,
  enabled,
  onClick,
}: {
  label: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button type="button" variant={enabled ? 'default' : 'outline'} onClick={onClick}>
      {label}: {enabled ? 'On' : 'Off'}
    </Button>
  );
}
