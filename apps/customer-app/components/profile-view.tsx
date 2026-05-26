'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import {
  deleteCustomerData,
  exportCustomerData,
  fetchCustomerProfile,
  fetchCustomerSessions,
  requestEmailVerification,
  revokeCustomerSession,
  updateCustomerProfile,
  type CustomerProfile,
  type CustomerSession,
} from '@/lib/api';
import { clearCustomerSession, setCustomerName } from '@/lib/session';
import { useTenantSettings } from '@/hooks/use-tenant-settings';

function getField(row: unknown, field: string): string | number | null {
  if (!row || typeof row !== 'object') return null;
  const value = (row as Record<string, unknown>)[field];
  return typeof value === 'string' || typeof value === 'number' ? value : null;
}

export function ProfileView() {
  const { formatCurrency, formatDateTime } = useTenantSettings();
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [preferencesText, setPreferencesText] = useState('{}');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyPush, setNotifyPush] = useState(true);
  const [marketingEmail, setMarketingEmail] = useState(true);
  const [marketingSms, setMarketingSms] = useState(false);
  const [marketingPush, setMarketingPush] = useState(false);
  const [sessions, setSessions] = useState<CustomerSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchCustomerProfile()
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone);
        setDateOfBirth(data.dateOfBirth ?? '');
        setGender(data.gender ?? '');
        setPreferencesText(JSON.stringify(data.preferences ?? {}, null, 2));
        setNotifyEmail(data.notificationPreferences.email);
        setNotifySms(data.notificationPreferences.sms);
        setNotifyPush(data.notificationPreferences.push);
        setMarketingEmail(data.marketingEmailOptIn ?? data.notificationPreferences.marketingEmail ?? true);
        setMarketingSms(data.marketingSmsOptIn ?? data.notificationPreferences.marketingSms ?? false);
        setMarketingPush(data.marketingPushOptIn ?? data.notificationPreferences.marketingPush ?? false);
      })
      .catch(() => {
        /* profile endpoint may be unimplemented */
      });
    void fetchCustomerSessions().then(setSessions).catch(() => setSessions([]));
  }, []);

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const preferences = preferencesText.trim() ? JSON.parse(preferencesText) as Record<string, unknown> : {};
      const updated = await updateCustomerProfile({
        name,
        email,
        phone,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        preferences,
        notificationPreferences: {
          email: notifyEmail,
          sms: notifySms,
          push: notifyPush,
          marketingEmail,
          marketingSms,
          marketingPush,
        },
        marketingEmailOptIn: marketingEmail,
        marketingSmsOptIn: marketingSms,
        marketingPushOptIn: marketingPush,
      });
      setProfile(updated);
      setCustomerName(updated.name);
      setMessage('Profile saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const sendVerification = async () => {
    setMessage(null);
    setError(null);
    try {
      await requestEmailVerification();
      setMessage('Verification request sent.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to request verification');
    }
  };

  const exportData = async () => {
    setMessage(null);
    setError(null);
    try {
      const data = await exportCustomerData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ordella-customer-data.json';
      link.click();
      URL.revokeObjectURL(url);
      setMessage('Data export prepared.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to export data');
    }
  };

  const deleteData = async () => {
    if (!window.confirm('Delete your customer account data? This cannot be undone.')) return;
    setError(null);
    try {
      await deleteCustomerData();
      clearCustomerSession();
      router.replace('/login');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete data');
    }
  };

  const revokeSession = async (sessionId: string) => {
    setError(null);
    try {
      await revokeCustomerSession(sessionId);
      setSessions((current) =>
        current.map((session) =>
          session.id === sessionId ? { ...session, revokedAt: new Date().toISOString(), isActive: false } : session,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to revoke session');
    }
  };

  const signOut = () => {
    clearCustomerSession();
    router.replace('/login');
  };

  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Account and notification settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={(e) => void onSave(e)}>
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
              </label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="dateOfBirth" className="text-sm font-medium">
                  Date of birth
                </label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="gender" className="text-sm font-medium">
                  Gender
                </label>
                <Input id="gender" value={gender} onChange={(e) => setGender(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="preferences" className="text-sm font-medium">
                Preferences
              </label>
              <textarea
                id="preferences"
                className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm"
                value={preferencesText}
                onChange={(e) => setPreferencesText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">JSON for dietary, delivery, product, or service preferences.</p>
            </div>

            <p className="pt-2 text-sm font-medium">Notifications</p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
              />
              Email updates
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
              />
              SMS updates
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notifyPush}
                onChange={(e) => setNotifyPush(e.target.checked)}
              />
              Push notifications
            </label>

            <p className="pt-2 text-sm font-medium">Marketing preferences</p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={marketingEmail}
                onChange={(e) => setMarketingEmail(e.target.checked)}
              />
              Promotional emails
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={marketingSms}
                onChange={(e) => setMarketingSms(e.target.checked)}
              />
              Promotional SMS
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={marketingPush}
                onChange={(e) => setMarketingPush(e.target.checked)}
              />
              Promotional push notifications
            </label>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
            {profile ? (
              <p className="text-xs text-muted-foreground">Profile ID: {profile.id}</p>
            ) : null}
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Loyalty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">{profile?.loyaltyPoints ?? profile?.pointsBalance ?? 0} points</p>
          <p className="text-muted-foreground">Tier: {profile?.loyaltyTier ?? 'Member'}</p>
          <div className="grid gap-2 text-muted-foreground">
            <p>Total orders: {profile?.totalOrders ?? 0}</p>
            <p>Average order: {formatCurrency(profile?.avgOrderValue ?? '0.00')}</p>
            <p>Order frequency: {profile?.orderFrequency ?? 'No orders yet'}</p>
          </div>
          {profile?.loyaltyHistory?.length ? (
            <div className="space-y-1 text-muted-foreground">
              {profile.loyaltyHistory.slice(0, 5).map((row, index) => (
                <p key={String(getField(row, 'id') ?? index)}>
                  {getField(row, 'type') ?? 'Activity'} · {getField(row, 'points') ?? 0} points
                </p>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No loyalty activity yet.</p>
          )}
          <Button asChild variant="outline">
            <Link href="/rewards">View rewards and referrals</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Store credit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">{formatCurrency(profile?.storeCreditBalance ?? '0.00')} available</p>
          {profile?.storeCreditHistory?.length ? (
            <div className="space-y-1 text-muted-foreground">
              {profile.storeCreditHistory.slice(0, 5).map((row, index) => (
                <p key={String(getField(row, 'id') ?? index)}>
                  {getField(row, 'type') ?? 'Activity'} · {formatCurrency(getField(row, 'amount') ?? '0.00')}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No store credit activity yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rewards & vouchers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">Linked vouchers and gift cards for checkout rewards.</p>
          {profile?.giftCards?.length ? (
            <div className="space-y-1 text-muted-foreground">
              {profile.giftCards.map((row, index) => (
                <p key={String(getField(row, 'id') ?? index)}>
                  {getField(row, 'code') ?? 'Gift card'} · {formatCurrency(getField(row, 'balance') ?? '0.00')}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No linked gift cards yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Email verification: {profile?.emailVerifiedAt ? 'verified' : 'not verified'}
          </p>
          {!profile?.emailVerifiedAt ? (
            <Button type="button" variant="outline" onClick={() => void sendVerification()}>
              Send verification email
            </Button>
          ) : null}
          <div className="space-y-2">
            <p className="font-medium">Devices and sessions</p>
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between rounded-md border p-2">
                <div>
                  <p>{session.deviceLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    Last seen {formatDateTime(session.lastSeenAt)} · {session.isActive ? 'Active' : 'Revoked'}
                  </p>
                </div>
                {session.isActive ? (
                  <Button type="button" variant="outline" onClick={() => void revokeSession(session.id)}>
                    Revoke
                  </Button>
                ) : null}
              </div>
            ))}
            {!sessions.length ? <p className="text-muted-foreground">No active sessions recorded.</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Locale {profile?.locale ?? 'tenant default'} · Currency {profile?.currency ?? 'tenant default'} · Timezone{' '}
            {profile?.timezone ?? 'tenant default'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => void exportData()}>
              Export my data
            </Button>
            <Button type="button" variant="destructive" onClick={() => void deleteData()}>
              Delete my data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button asChild variant="outline">
        <Link href="/addresses">Manage addresses</Link>
      </Button>

      <Button asChild variant="outline">
        <Link href="/saved">Saved baskets & items</Link>
      </Button>

      <Button asChild variant="outline">
        <Link href="/subscriptions">Manage subscriptions</Link>
      </Button>

      <Button variant="destructive" onClick={signOut}>
        Sign out
      </Button>
    </div>
  );
}
