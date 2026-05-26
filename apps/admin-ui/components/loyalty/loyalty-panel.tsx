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
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared-ui';
import {
  adjustLoyaltyPoints,
  getLoyaltyAnalytics,
  getLoyaltyCustomer,
  getLoyaltySettings,
  listLoyaltyTransactions,
  searchLoyaltyCustomers,
  updateLoyaltySettings,
  type LoyaltyAnalytics,
  type LoyaltyCustomer,
  type LoyaltySettings,
  type LoyaltyTransaction,
} from '@/lib/api/loyalty';
import { getErrorMessage } from '@/lib/utils';
import { useTenantSettings } from '@/hooks/use-tenant-settings';

export function LoyaltyPanel() {
  const { formatCurrency, formatDate } = useTenantSettings();
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<LoyaltyCustomer | null>(null);
  const [analytics, setAnalytics] = useState<LoyaltyAnalytics | null>(null);
  const [customerFilter, setCustomerFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [adjustment, setAdjustment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [settingsData, transactionData, customerData, analyticsData] = await Promise.all([
        getLoyaltySettings(),
        listLoyaltyTransactions(),
        searchLoyaltyCustomers(),
        getLoyaltyAnalytics(),
      ]);
      setSettings(settingsData);
      setTransactions(transactionData);
      setCustomers(customerData);
      setAnalytics(analyticsData);
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
      });
      setSettings(updated);
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

  if (loading) return <p className="text-sm text-muted-foreground">Loading loyalty settings...</p>;

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-md border border-destructive p-3 text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Points issued" value={analytics?.totalPointsIssued ?? 0} />
        <Metric title="Points redeemed" value={analytics?.totalPointsRedeemed ?? 0} />
        <Metric title="Unused points" value={analytics?.breakage ?? 0} />
        <Metric title="Customer lifetime value" value={formatCurrency(analytics?.customerLifetimeValue)} />
      </div>

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
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Search customer profiles and adjust points manually.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Search by name, email, or phone" value={customerFilter} onChange={(event) => setCustomerFilter(event.target.value)} />
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
                <div className="grid gap-3 md:grid-cols-3">
                  <Metric title="Points balance" value={selectedCustomer.pointsBalance} />
                  <Metric title="Lifetime value" value={formatCurrency(selectedCustomer.lifetimeValue)} />
                  <Metric title="Last order" value={selectedCustomer.lastOrderAt ? formatDate(selectedCustomer.lastOrderAt) : 'No orders'} />
                </div>
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
          <div className="flex flex-col gap-2 md:flex-row">
            <Input placeholder="Filter by customer" value={customerFilter} onChange={(event) => setCustomerFilter(event.target.value)} />
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="">All types</option>
              <option value="earn">Earn</option>
              <option value="redeem">Redeem</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>
          <TransactionTable transactions={filteredTransactions} />
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Toggle({ label, enabled, onClick }: { label: string; enabled: boolean; onClick: () => void }) {
  return (
    <button type="button" className="rounded-lg border p-3 text-left hover:bg-muted" onClick={onClick}>
      <span className="block text-sm font-medium">{label}</span>
      <Badge variant={enabled ? 'default' : 'secondary'} className="mt-2">{enabled ? 'On' : 'Off'}</Badge>
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
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Points</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length ? transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{transaction.customer?.name ?? transaction.customerId}</TableCell>
            <TableCell><Badge variant="outline">{transaction.type}</Badge></TableCell>
            <TableCell>{transaction.points}</TableCell>
            <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">No loyalty transactions yet.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
