'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useEffect, useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack } from '@shared-ui';
import {
  adjustLoyaltyPoints,
  createLoyaltyReferral,
  getLoyaltyAnalytics,
  getLoyaltyCustomer,
  getLoyaltySettings,
  listLoyaltyReferrals,
  listLoyaltyRewards,
  listLoyaltyTiers,
  listLoyaltyTransactions,
  searchLoyaltyCustomers,
  upsertLoyaltyReward,
  upsertLoyaltyTier,
  updateLoyaltySettings,
  type LoyaltyAnalytics,
  type LoyaltyCustomer,
  type LoyaltyReferral,
  type LoyaltyReward,
  type LoyaltySettings,
  type LoyaltyTier,
  type LoyaltyTransaction,
} from '@/lib/api/loyalty';
import { getErrorMessage } from '@/lib/utils';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';

import { PanelEmpty } from '@/components/ui/admin-empty-state';
import { PanelCardsSkeleton } from '@/components/ui/admin-loader';
import {
  FilterBar,
  FilterGroup,
  FilterItem,
  FilterSelect,
} from '@/components/ui/admin-filter';
import { SearchInput } from '@/components/ui/admin-search';
export function LoyaltyPanel() {
  const { formatCurrency, formatDate } = useTenantSettings();
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [referrals, setReferrals] = useState<LoyaltyReferral[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<LoyaltyCustomer | null>(null);
  const [analytics, setAnalytics] = useState<LoyaltyAnalytics | null>(null);
  const [customerFilter, setCustomerFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [adjustment, setAdjustment] = useState('');
  const [tierDraft, setTierDraft] = useState({ name: 'Silver', pointsThreshold: '500', spendThreshold: '100', pointsMultiplier: '1', discountPercent: '0', perks: '' });
  const [rewardDraft, setRewardDraft] = useState({ name: '', type: 'voucher' as LoyaltyReward['type'], pointsCost: '500', discountAmount: '', discountPercent: '', tierNames: '' });
  const [referralDraft, setReferralDraft] = useState({ referrerCustomerId: '', referredCustomerId: '', code: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [settingsData, transactionData, customerData, analyticsData, tierData, rewardData, referralData] = await Promise.all([
        getLoyaltySettings(),
        listLoyaltyTransactions(),
        searchLoyaltyCustomers(),
        getLoyaltyAnalytics(),
        listLoyaltyTiers(),
        listLoyaltyRewards(),
        listLoyaltyReferrals(),
      ]);
      setSettings(settingsData);
      setTransactions(transactionData);
      setCustomers(customerData);
      setAnalytics(analyticsData);
      setTiers(tierData);
      setRewards(rewardData);
      setReferrals(referralData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesType = typeFilter ? transaction.type === typeFilter : true;
      const customer = transaction.customer;
      const term = customerFilter.trim().toLowerCase();
      const matchesCustomer = term
        ? [customer?.name, customer?.email, customer?.phone].some((value) => value?.toLowerCase().includes(term))
        : true;
      return matchesType && matchesCustomer;
    });
  }, [customerFilter, transactions, typeFilter]);

  async function saveSettings(next: LoyaltySettings) {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateLoyaltySettings({
        isEnabled: next.isEnabled,
        earnRate: Number(next.earnRate),
        redeemRate: Number(next.redeemRate),
        autoEnroll: next.autoEnroll,
        minRedeemPoints: next.minRedeemPoints,
        maxRedeemPercent: next.maxRedeemPercent,
        currency: next.currency ?? undefined,
        pointsExpireDays: next.pointsExpireDays ?? undefined,
        referralEnabled: next.referralEnabled,
        referrerBonusPoints: next.referrerBonusPoints,
        refereeBonusPoints: next.refereeBonusPoints,
        maxDailyRedemptions: next.maxDailyRedemptions,
        maxDailyReferrals: next.maxDailyReferrals,
      });
      setSettings(updated);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function submitTier() {
    setSaving(true);
    setError(null);
    try {
      const tier = await upsertLoyaltyTier({
        name: tierDraft.name,
        pointsThreshold: Number(tierDraft.pointsThreshold),
        spendThreshold: Number(tierDraft.spendThreshold),
        pointsMultiplier: Number(tierDraft.pointsMultiplier),
        discountPercent: Number(tierDraft.discountPercent || 0),
        perks: tierDraft.perks.split(',').map((perk) => perk.trim()).filter(Boolean),
        isActive: true,
      });
      setTiers((current) => [tier, ...current.filter((row) => row.id !== tier.id)].sort((a, b) => a.pointsThreshold - b.pointsThreshold));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function submitReward() {
    if (!rewardDraft.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const reward = await upsertLoyaltyReward({
        name: rewardDraft.name,
        type: rewardDraft.type,
        pointsCost: Number(rewardDraft.pointsCost),
        discountAmount: rewardDraft.discountAmount ? Number(rewardDraft.discountAmount) : undefined,
        discountPercent: rewardDraft.discountPercent ? Number(rewardDraft.discountPercent) : undefined,
        tierNames: rewardDraft.tierNames.split(',').map((tier) => tier.trim()).filter(Boolean),
        isActive: true,
      });
      setRewards((current) => [reward, ...current.filter((row) => row.id !== reward.id)]);
      setRewardDraft({ name: '', type: 'voucher', pointsCost: '500', discountAmount: '', discountPercent: '', tierNames: '' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function submitReferral() {
    if (!referralDraft.referrerCustomerId.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const referral = await createLoyaltyReferral({
        referrerCustomerId: referralDraft.referrerCustomerId.trim(),
        referredCustomerId: referralDraft.referredCustomerId.trim() || undefined,
        code: referralDraft.code.trim() || undefined,
      });
      setReferrals((current) => [referral, ...current]);
      setReferralDraft({ referrerCustomerId: '', referredCustomerId: '', code: '' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function openCustomer(customerId: string) {
    setError(null);
    try {
      setSelectedCustomer(await getLoyaltyCustomer(customerId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function submitAdjustment() {
    if (!selectedCustomer || !adjustment.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await adjustLoyaltyPoints({ customerId: selectedCustomer.id, points: Number(adjustment) });
      setAdjustment('');
      const [customer, transactionData, analyticsData] = await Promise.all([
        getLoyaltyCustomer(selectedCustomer.id),
        listLoyaltyTransactions(),
        getLoyaltyAnalytics(),
      ]);
      setSelectedCustomer(customer);
      setTransactions(transactionData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PanelCardsSkeleton count={2} />;

  return (
    <Stack gap="lg" className="min-w-0">
      {error ? <FormErrorAlert message={error} /> : null}

      <MetricGrid columns={4}>
        <Metric title="Points issued" value={analytics?.totalPointsIssued ?? 0} />
        <Metric title="Points redeemed" value={analytics?.totalPointsRedeemed ?? 0} />
        <Metric title="Unused points" value={analytics?.breakage ?? 0} />
        <Metric title="Customer lifetime value" value={formatCurrency(analytics?.customerLifetimeValue)} />
      </MetricGrid>

      {settings ? (
        <Card>
          <CardHeader>
            <CardTitle>Loyalty & Rewards Settings</CardTitle>
            <CardDescription>Set how customers earn and redeem rewards across every sales channel.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Toggle label="Loyalty enabled" enabled={settings.isEnabled} onClick={() => void saveSettings({ ...settings, isEnabled: !settings.isEnabled })} />
            <Toggle label="Auto-enroll customers" enabled={settings.autoEnroll} onClick={() => void saveSettings({ ...settings, autoEnroll: !settings.autoEnroll })} />
            <SettingInput label="Points per EUR 1" value={settings.earnRate} onChange={(earnRate) => setSettings({ ...settings, earnRate })} onBlur={() => void saveSettings(settings)} />
            <SettingInput label="Value per point" value={settings.redeemRate} onChange={(redeemRate) => setSettings({ ...settings, redeemRate })} onBlur={() => void saveSettings(settings)} />
            <SettingInput label="Minimum redeemable points" value={String(settings.minRedeemPoints)} onChange={(value) => setSettings({ ...settings, minRedeemPoints: Number(value) })} onBlur={() => void saveSettings(settings)} />
            <SettingInput label="Maximum discount %" value={String(settings.maxRedeemPercent)} onChange={(value) => setSettings({ ...settings, maxRedeemPercent: Number(value) })} onBlur={() => void saveSettings(settings)} />
            <SettingInput label="Currency" value={settings.currency ?? ''} onChange={(currency) => setSettings({ ...settings, currency })} onBlur={() => void saveSettings(settings)} />
            <SettingInput label="Referrer bonus points" value={String(settings.referrerBonusPoints ?? 0)} onChange={(value) => setSettings({ ...settings, referrerBonusPoints: Number(value) })} onBlur={() => void saveSettings(settings)} />
            <SettingInput label="Referee bonus points" value={String(settings.refereeBonusPoints ?? 0)} onChange={(value) => setSettings({ ...settings, refereeBonusPoints: Number(value) })} onBlur={() => void saveSettings(settings)} />
            <SettingInput label="Daily redemption limit" value={String(settings.maxDailyRedemptions ?? 5)} onChange={(value) => setSettings({ ...settings, maxDailyRedemptions: Number(value) })} onBlur={() => void saveSettings(settings)} />
            <SettingInput label="Daily referral limit" value={String(settings.maxDailyReferrals ?? 10)} onChange={(value) => setSettings({ ...settings, maxDailyReferrals: Number(value) })} onBlur={() => void saveSettings(settings)} />
            <Toggle label="Referral program" enabled={settings.referralEnabled} onClick={() => void saveSettings({ ...settings, referralEnabled: !settings.referralEnabled })} />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Loyalty tiers</CardTitle>
            <CardDescription>Define thresholds and tier benefits for promotions and rewards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 md:grid-cols-2">
              <Input placeholder="Tier name" value={tierDraft.name} onChange={(event) => setTierDraft({ ...tierDraft, name: event.target.value })} />
              <Input placeholder="Points threshold" value={tierDraft.pointsThreshold} onChange={(event) => setTierDraft({ ...tierDraft, pointsThreshold: event.target.value })} />
              <Input placeholder="Spend threshold" value={tierDraft.spendThreshold} onChange={(event) => setTierDraft({ ...tierDraft, spendThreshold: event.target.value })} />
              <Input placeholder="Points multiplier" value={tierDraft.pointsMultiplier} onChange={(event) => setTierDraft({ ...tierDraft, pointsMultiplier: event.target.value })} />
              <Input placeholder="Discount %" value={tierDraft.discountPercent} onChange={(event) => setTierDraft({ ...tierDraft, discountPercent: event.target.value })} />
              <Input placeholder="Perks, comma separated" value={tierDraft.perks} onChange={(event) => setTierDraft({ ...tierDraft, perks: event.target.value })} />
            </div>
            <Button type="button" disabled={saving} onClick={() => void submitTier()}>Save tier</Button>
            <div className="space-y-2">
              {tiers.map((tier) => (
                <div key={tier.id} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{tier.name}</p>
                  <p className="text-muted-foreground">{tier.pointsThreshold} pts or {formatCurrency(tier.spendThreshold)} spend · {tier.pointsMultiplier}x</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rewards catalog</CardTitle>
            <CardDescription>Create vouchers, discounts, and free-item rewards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Reward name" value={rewardDraft.name} onChange={(event) => setRewardDraft({ ...rewardDraft, name: event.target.value })} />
            <Select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={rewardDraft.type} onChange={(event) => setRewardDraft({ ...rewardDraft, type: event.target.value as LoyaltyReward['type'] })}>
              <option value="voucher">Voucher</option>
              <option value="discount">Discount</option>
              <option value="free_item">Free item</option>
            </Select>
            <div className="grid gap-2 md:grid-cols-2">
              <Input placeholder="Points cost" value={rewardDraft.pointsCost} onChange={(event) => setRewardDraft({ ...rewardDraft, pointsCost: event.target.value })} />
              <Input placeholder="Discount amount" value={rewardDraft.discountAmount} onChange={(event) => setRewardDraft({ ...rewardDraft, discountAmount: event.target.value })} />
              <Input placeholder="Discount %" value={rewardDraft.discountPercent} onChange={(event) => setRewardDraft({ ...rewardDraft, discountPercent: event.target.value })} />
              <Input placeholder="Tier names" value={rewardDraft.tierNames} onChange={(event) => setRewardDraft({ ...rewardDraft, tierNames: event.target.value })} />
            </div>
            <Button type="button" disabled={saving} onClick={() => void submitReward()}>Create reward</Button>
            <div className="space-y-2">
              {rewards.map((reward) => (
                <div key={reward.id} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{reward.name}</p>
                  <p className="text-muted-foreground">{reward.type} · {reward.pointsCost} points · {reward.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral bonuses</CardTitle>
            <CardDescription>Track referral codes, conversions, and fraud flags.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Referrer customer ID" value={referralDraft.referrerCustomerId} onChange={(event) => setReferralDraft({ ...referralDraft, referrerCustomerId: event.target.value })} />
            <Input placeholder="Referred customer ID (optional)" value={referralDraft.referredCustomerId} onChange={(event) => setReferralDraft({ ...referralDraft, referredCustomerId: event.target.value })} />
            <Input placeholder="Referral code (optional)" value={referralDraft.code} onChange={(event) => setReferralDraft({ ...referralDraft, code: event.target.value })} />
            <Button type="button" disabled={saving} onClick={() => void submitReferral()}>Create referral</Button>
            <div className="space-y-2">
              {referrals.slice(0, 8).map((referral) => (
                <div key={referral.id} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{referral.code}</p>
                  <p className="text-muted-foreground">{referral.status} · {referral.referrerBonusPoints}/{referral.refereeBonusPoints} points</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Search customer profiles and adjust points manually.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SearchInput
              placeholder="Search by name, email, or phone"
              value={customerFilter}
              onChange={(event) => setCustomerFilter(event.target.value)}
              onClear={() => setCustomerFilter('')}
              active={Boolean(customerFilter.trim())}
              aria-label="Search loyalty customers"
            />
            <div className="space-y-2">
              {customers
                .filter((customer) => {
                  const term = customerFilter.trim().toLowerCase();
                  if (!term) return true;
                  return [customer.name, customer.email, customer.phone].some((value) => value?.toLowerCase().includes(term));
                })
                .slice(0, 8)
                .map((customer) => (
                  <button key={customer.id} type="button" className="w-full rounded-md border p-3 text-left hover:bg-muted" onClick={() => void openCustomer(customer.id)}>
                    <span className="block text-sm font-medium">{customer.name}</span>
                    <span className="block text-xs text-muted-foreground">{customer.email ?? customer.phone ?? 'No contact'} - {customer.pointsBalance} points</span>
                  </button>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{selectedCustomer ? selectedCustomer.name : 'Customer Profile'}</CardTitle>
            <CardDescription>Points balance, lifetime value, and loyalty history.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCustomer ? (
              <>
                <MetricGrid columns={3}>
                  <Metric title="Points balance" value={selectedCustomer.pointsBalance} />
                  <Metric title="Lifetime value" value={formatCurrency(selectedCustomer.lifetimeValue)} />
                  <Metric title="Last order" value={selectedCustomer.lastOrderAt ? formatDate(selectedCustomer.lastOrderAt) : 'No orders'} />
                </MetricGrid>
                <div className="flex gap-2">
                  <Input placeholder="Add or remove points, e.g. 50 or -20" value={adjustment} onChange={(event) => setAdjustment(event.target.value)} />
                  <Button type="button" disabled={saving} onClick={() => void submitAdjustment()}>Adjust</Button>
                </div>
                <TransactionTable transactions={selectedCustomer.transactions ?? []} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select a customer to view their rewards profile.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loyalty History</CardTitle>
          <CardDescription>Review earned points, redemptions, and adjustments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <FilterBar as="div">
            <FilterGroup columns={2}>
              <FilterItem label="Customer" htmlFor="loyalty-history-customer" active={Boolean(customerFilter)}>
                <SearchInput
                  id="loyalty-history-customer"
                  placeholder="Filter by customer"
                  value={customerFilter}
                  onChange={(event) => setCustomerFilter(event.target.value)}
                  onClear={() => setCustomerFilter('')}
                  active={Boolean(customerFilter.trim())}
                  aria-label="Filter loyalty history by customer"
                />
              </FilterItem>
              <FilterItem label="Transaction type" htmlFor="loyalty-history-type" active={Boolean(typeFilter)}>
                <FilterSelect
                  id="loyalty-history-type"
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                >
                  <option value="">All types</option>
                  <option value="earn">Earn</option>
                  <option value="redeem">Redeem</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="referral">Referral</option>
                  <option value="promotion">Promotion</option>
                </FilterSelect>
              </FilterItem>
            </FilterGroup>
          </FilterBar>
          <TransactionTable transactions={filteredTransactions} />
        </CardContent>
      </Card>
    </Stack>
  );
}

function Toggle({ label, enabled, onClick }: { label: string; enabled: boolean; onClick: () => void }) {
  return (
    <button type="button" className="w-full text-left" onClick={onClick}>
      <Card className="border-border shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/30">
        <CardContent className="p-3">
          <span className="block text-sm font-medium">{label}</span>
          <Tag variant={enabled ? 'brand' : 'neutral'} className="mt-2"><TagLabel>{enabled ? 'On' : 'Off'}</TagLabel></Tag>
        </CardContent>
      </Card>
    </button>
  );
}

function SettingInput({ label, value, onChange, onBlur }: { label: string; value: string; onChange: (value: string) => void; onBlur: () => void }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} />
    </label>
  );
}

function TransactionTable({ transactions }: { transactions: LoyaltyTransaction[] }) {
  const { formatDateTime } = useTenantSettings();
  return (
    <Table>
      <TableHeader sticky>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Points</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody zebra>
        {transactions.length ? transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{transaction.customer?.name ?? transaction.customerId}</TableCell>
            <TableCell><Tag variant="outline"><TagLabel>{transaction.type}</TagLabel></Tag></TableCell>
            <TableCell>{transaction.source ?? 'order'}</TableCell>
            <TableCell>{transaction.points}</TableCell>
            <TableCell>{transaction.balanceAfter ?? 'N/A'}</TableCell>
            <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={6} className="p-0"><PanelEmpty title="No loyalty transactions yet" description="Transactions and activity will appear here." size="compact" className="max-w-none border-0 shadow-none" /></TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
