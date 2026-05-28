'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack } from '@shared-ui';
import {
  addStoreCredit,
  adjustGiftCard,
  createGiftCard,
  deductStoreCredit,
  getGiftCardAnalytics,
  listGiftCards,
  listStoreCreditHistory,
  setGiftCardStatus,
  type GiftCard,
  type GiftCardAnalytics,
  type StoreCreditTransaction,
} from '@/lib/api/giftcards';
import { searchLoyaltyCustomers, type LoyaltyCustomer } from '@/lib/api/loyalty';
import { getErrorMessage } from '@/lib/utils';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';
import { SearchInput } from '@/components/ui/admin-search';

import { PanelEmpty } from '@/components/ui/admin-empty-state';
import { TablePanelSkeleton } from '@/components/ui/admin-loader';

export function GiftCardsPanel() {
  const { formatCurrency, formatDate } = useTenantSettings();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<LoyaltyCustomer | null>(null);
  const [storeCreditHistory, setStoreCreditHistory] = useState<StoreCreditTransaction[]>([]);
  const [analytics, setAnalytics] = useState<GiftCardAnalytics | null>(null);
  const [initialValue, setInitialValue] = useState('');
  const [expiry, setExpiry] = useState('');
  const [giftAdjustment, setGiftAdjustment] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [cards, customerData, analyticsData] = await Promise.all([
        listGiftCards(),
        searchLoyaltyCustomers(),
        getGiftCardAnalytics(),
      ]);
      setGiftCards(cards);
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

  const filteredCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase();
    if (!term) return customers.slice(0, 8);
    return customers
      .filter((customer) =>
        [customer.name, customer.email, customer.phone].some((value) => value?.toLowerCase().includes(term)),
      )
      .slice(0, 8);
  }, [customerSearch, customers]);

  async function issueGiftCard() {
    setSaving(true);
    setError(null);
    try {
      const card = await createGiftCard({
        initialValue: Number(initialValue),
        customerId: selectedCustomer?.id,
        expiresAt: expiry || undefined,
      });
      setGiftCards([card, ...giftCards]);
      setSelectedCard(card);
      setInitialValue('');
      setExpiry('');
      setAnalytics(await getGiftCardAnalytics());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function adjustSelectedCard() {
    if (!selectedCard || !giftAdjustment.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const card = await adjustGiftCard({ giftCardId: selectedCard.id, amount: Number(giftAdjustment) });
      setSelectedCard(card);
      setGiftCards(giftCards.map((item) => (item.id === card.id ? card : item)));
      setGiftAdjustment('');
      setAnalytics(await getGiftCardAnalytics());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleSelectedCard() {
    if (!selectedCard) return;
    const card = await setGiftCardStatus({ giftCardId: selectedCard.id, isActive: !selectedCard.isActive });
    setSelectedCard(card);
    setGiftCards(giftCards.map((item) => (item.id === card.id ? card : item)));
  }

  async function openCustomer(customer: LoyaltyCustomer) {
    setSelectedCustomer(customer);
    setStoreCreditHistory(await listStoreCreditHistory(customer.id));
  }

  async function mutateStoreCredit(direction: 'add' | 'deduct') {
    if (!selectedCustomer || !creditAmount.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (direction === 'add') {
        await addStoreCredit({ customerId: selectedCustomer.id, amount: Number(creditAmount), type: 'adjustment' });
      } else {
        await deductStoreCredit({ customerId: selectedCustomer.id, amount: Number(creditAmount) });
      }
      setCreditAmount('');
      const [freshCustomers, history, analyticsData] = await Promise.all([
        searchLoyaltyCustomers(),
        listStoreCreditHistory(selectedCustomer.id),
        getGiftCardAnalytics(),
      ]);
      setCustomers(freshCustomers);
      setSelectedCustomer(freshCustomers.find((customer) => customer.id === selectedCustomer.id) ?? selectedCustomer);
      setStoreCreditHistory(history);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <TablePanelSkeleton rows={5} columns={6} />;

  return (
    <Stack gap="lg" className="min-w-0">
      {error ? <FormErrorAlert message={error} /> : null}

      <MetricGrid columns={5}>
        <Metric title="Gift card sales" value={formatCurrency(analytics?.giftCardSales)} />
        <Metric title="Gift card redemptions" value={formatCurrency(analytics?.giftCardRedemptions)} />
        <Metric title="Outstanding liability" value={formatCurrency(analytics?.outstandingLiability)} />
        <Metric title="Store credit issued" value={formatCurrency(analytics?.storeCreditIssued)} />
        <Metric title="Store credit used" value={formatCurrency(analytics?.storeCreditRedeemed)} />
      </MetricGrid>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Create Gift Card</CardTitle>
            <CardDescription>Issue a digital gift card with an optional customer link.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Initial value" value={initialValue} onChange={(event) => setInitialValue(event.target.value)} />
            <Input type="date" value={expiry} onChange={(event) => setExpiry(event.target.value)} />
            <SearchInput
              placeholder="Search customer (optional)"
              value={customerSearch}
              onChange={(event) => setCustomerSearch(event.target.value)}
              onClear={() => setCustomerSearch('')}
              active={Boolean(customerSearch.trim())}
              aria-label="Search customers for gift card"
            />
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <button key={customer.id} type="button" className="w-full rounded-md border p-2 text-left text-sm hover:bg-muted" onClick={() => void openCustomer(customer)}>
                  {customer.name}
                  <span className="block text-xs text-muted-foreground">{customer.email ?? customer.phone ?? 'No contact'}</span>
                </button>
              ))}
            </div>
            {selectedCustomer ? <p className="text-sm text-muted-foreground">Selected: {selectedCustomer.name}</p> : null}
            <Button type="button" disabled={saving || !initialValue} onClick={() => void issueGiftCard()}>Issue gift card</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gift Cards</CardTitle>
            <CardDescription>View balances, status, customers, and transaction history.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {giftCards.map((card) => (
                  <TableRow key={card.id} className="cursor-pointer" onClick={() => setSelectedCard(card)}>
                    <TableCell>{card.code}</TableCell>
                    <TableCell>{formatCurrency(card.balance)}</TableCell>
                    <TableCell><Tag variant={card.isActive ? 'brand' : 'neutral'}><TagLabel>{card.isActive ? 'Active' : 'Disabled'}</TagLabel></Tag></TableCell>
                    <TableCell>{card.customer?.name ?? 'Unassigned'}</TableCell>
                    <TableCell>{formatDate(card.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {selectedCard ? (
        <Card>
          <CardHeader>
            <CardTitle>Gift Card {selectedCard.code}</CardTitle>
            <CardDescription>Adjust the balance or disable this gift card.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricGrid columns={3}>
              <Metric title="Balance" value={formatCurrency(selectedCard.balance)} />
              <Metric title="Initial value" value={formatCurrency(selectedCard.initialValue)} />
              <Metric title="Status" value={selectedCard.isActive ? 'Active' : 'Disabled'} />
            </MetricGrid>
            <div className="flex flex-col gap-2 md:flex-row">
              <Input placeholder="Adjustment amount, e.g. 10 or -5" value={giftAdjustment} onChange={(event) => setGiftAdjustment(event.target.value)} />
              <Button type="button" disabled={saving} onClick={() => void adjustSelectedCard()}>Adjust</Button>
              <Button type="button" variant="outline" onClick={() => void toggleSelectedCard()}>{selectedCard.isActive ? 'Disable' : 'Enable'}</Button>
            </div>
            <TransactionList transactions={selectedCard.transactions ?? []} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Store Credit</CardTitle>
          <CardDescription>Add or deduct credit from a customer profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedCustomer ? (
            <>
              <MetricGrid columns={3}>
                <Metric title="Customer" value={selectedCustomer.name} />
                <Metric title="Store credit balance" value={formatCurrency(selectedCustomer.storeCreditBalance)} />
                <Metric title="Contact" value={selectedCustomer.email ?? selectedCustomer.phone ?? 'No contact'} />
              </MetricGrid>
              <div className="flex flex-col gap-2 md:flex-row">
                <Input placeholder="Credit amount" value={creditAmount} onChange={(event) => setCreditAmount(event.target.value)} />
                <Button type="button" disabled={saving} onClick={() => void mutateStoreCredit('add')}>Add credit</Button>
                <Button type="button" variant="outline" disabled={saving} onClick={() => void mutateStoreCredit('deduct')}>Deduct credit</Button>
              </div>
              <TransactionList transactions={storeCreditHistory} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a customer from the creator search to manage store credit.</p>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}


function TransactionList({ transactions }: { transactions: Array<{ id: string; amount: string; type: string; createdAt: string }> }) {
  const { formatCurrency, formatDateTime } = useTenantSettings();
  return (
    <div className="space-y-2">
      {transactions.length ? transactions.map((transaction) => (
        <div key={transaction.id} className="flex justify-between rounded-md border p-3 text-sm">
          <span>{transaction.type}</span>
          <span>{formatCurrency(transaction.amount)} - {formatDateTime(transaction.createdAt)}</span>
        </div>
      )) : <PanelEmpty title="No transactions yet" description="Content will appear here when available." />}
    </div>
  );
}
