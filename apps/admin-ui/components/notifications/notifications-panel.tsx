'use client';

import { useEffect, useState } from 'react';
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
} from '@shared-ui';
import {
  getNotificationPreferences,
  listNotificationHistory,
  updateNotificationPreferences,
  type NotificationHistoryItem,
  type NotificationPreference,
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

export function NotificationsPanel() {
  const { formatDateTime } = useTenantSettings();
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [preferenceData, historyData] = await Promise.all([
        getNotificationPreferences(),
        listNotificationHistory(),
      ]);
      setPreferences(preferenceData);
      setHistory(historyData);
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

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
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
          <CardTitle>History</CardTitle>
          <CardDescription>Recent email, SMS, and push notifications.</CardDescription>
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
