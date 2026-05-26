'use client';

import { useEffect, useState } from 'react';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { fetchCustomerProfile, type CustomerProfile } from '@/lib/api';
import { useTenantSettings } from '@/hooks/use-tenant-settings';

function value(row: unknown, field: string): string | number | null {
  if (!row || typeof row !== 'object') return null;
  const fieldValue = (row as Record<string, unknown>)[field];
  return typeof fieldValue === 'string' || typeof fieldValue === 'number' ? fieldValue : null;
}

export function RewardsView() {
  const { formatCurrency, formatDateTime } = useTenantSettings();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchCustomerProfile()
      .then(setProfile)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load rewards'));
  }, []);

  const rewards = profile?.availableRewards ?? [];
  const referralCode = value(profile?.referral, 'code');
  const referralLink = value(profile?.referral, 'referralLink');

  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Rewards</h1>
        <p className="text-sm text-muted-foreground">Points, tiers, rewards, referrals, and activity</p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Points balance</p>
            <p className="text-lg font-semibold">{profile?.pointsBalance ?? profile?.loyaltyPoints ?? 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tier</p>
            <p className="text-lg font-semibold">{profile?.loyaltyTier ?? 'Member'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Lifetime value</p>
            <p className="text-lg font-semibold">{formatCurrency(profile?.lifetimeValue ?? '0.00')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available rewards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {rewards.map((reward, index) => (
            <div key={String(value(reward, 'id') ?? index)} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{value(reward, 'name') ?? 'Reward'}</p>
                <Badge variant="secondary">{value(reward, 'pointsCost') ?? 0} points</Badge>
              </div>
              <p className="text-muted-foreground">
                {value(reward, 'type') ?? 'reward'} · Discount {value(reward, 'discountAmount') ?? value(reward, 'discountPercent') ?? 'available'}
              </p>
            </div>
          ))}
          {!rewards.length ? <p className="text-muted-foreground">No rewards available yet.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Referral link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">{referralCode ?? 'No referral code yet'}</p>
          <p className="break-all text-muted-foreground">{referralLink ?? 'Your referral link will appear here.'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {profile?.loyaltyHistory?.slice(0, 20).map((row, index) => (
            <div key={String(value(row, 'id') ?? index)} className="flex justify-between gap-3 border-b pb-2 last:border-b-0">
              <div>
                <p className="font-medium">{value(row, 'type') ?? 'Activity'} · {value(row, 'source') ?? 'order'}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(String(value(row, 'createdAt') ?? ''))}
                </p>
              </div>
              <p>{value(row, 'points') ?? 0} pts</p>
            </div>
          ))}
          {!profile?.loyaltyHistory?.length ? <p className="text-muted-foreground">No loyalty activity yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
