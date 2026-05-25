'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import { fetchCustomerProfile, updateCustomerProfile, type CustomerProfile } from '@/lib/api';
import { clearCustomerSession, setCustomerName } from '@/lib/session';

function getField(row: unknown, field: string): string | number | null {
  if (!row || typeof row !== 'object') return null;
  const value = (row as Record<string, unknown>)[field];
  return typeof value === 'string' || typeof value === 'number' ? value : null;
}

export function ProfileView() {
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyPush, setNotifyPush] = useState(true);
  const [marketingEmail, setMarketingEmail] = useState(true);
  const [marketingSms, setMarketingSms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchCustomerProfile()
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone);
        setNotifyEmail(data.notificationPreferences.email);
        setNotifySms(data.notificationPreferences.sms);
        setNotifyPush(data.notificationPreferences.push);
        setMarketingEmail(data.marketingEmailOptIn ?? data.notificationPreferences.marketingEmail ?? true);
        setMarketingSms(data.marketingSmsOptIn ?? data.notificationPreferences.marketingSms ?? false);
      })
      .catch(() => {
        /* profile endpoint may be unimplemented */
      });
  }, []);

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateCustomerProfile({
        name,
        email,
        phone,
        notificationPreferences: {
          email: notifyEmail,
          sms: notifySms,
          push: notifyPush,
            marketingEmail,
            marketingSms,
        },
          marketingEmailOptIn: marketingEmail,
          marketingSmsOptIn: marketingSms,
      });
      setProfile(updated);
      setCustomerName(updated.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile');
    } finally {
      setSaving(false);
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

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
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
          <div className="grid gap-2 text-muted-foreground">
            <p>Total orders: {profile?.totalOrders ?? 0}</p>
            <p>Average order: ${profile?.avgOrderValue ?? '0.00'}</p>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Store credit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">${profile?.storeCreditBalance ?? '0.00'} available</p>
          {profile?.storeCreditHistory?.length ? (
            <div className="space-y-1 text-muted-foreground">
              {profile.storeCreditHistory.slice(0, 5).map((row, index) => (
                <p key={String(getField(row, 'id') ?? index)}>
                  {getField(row, 'type') ?? 'Activity'} · ${getField(row, 'amount') ?? '0.00'}
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
          <CardTitle className="text-base">Gift cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {profile?.giftCards?.length ? (
            <div className="space-y-1 text-muted-foreground">
              {profile.giftCards.map((row, index) => (
                <p key={String(getField(row, 'id') ?? index)}>
                  {getField(row, 'code') ?? 'Gift card'} · ${getField(row, 'balance') ?? '0.00'}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No linked gift cards yet.</p>
          )}
        </CardContent>
      </Card>

      <Button asChild variant="outline">
        <Link href="/addresses">Manage addresses</Link>
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
