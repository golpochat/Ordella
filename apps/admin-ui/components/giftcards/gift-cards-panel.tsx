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

function money(value: string | number | null | undefined) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(Number(value ?? 0));
}

export function GiftCardsPanel() {
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

  if (loading) return <p className="text-sm text-muted-foreground">Loading gift cards...</p>;

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-md border border-destructive p-3 text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-5">
        <Metric title="Gift card sales" value={money(analytics?.giftCardSales)} />
        <Metric title="Gift card redemptions" value={money(analytics?.giftCardRedemptions)} />
        <Metric title="Outstanding liability" value={money(analytics?.outstandingLiability)} />
        <Metric title="Store credit issued" value={money(analytics?.storeCreditIssued)} />
        <Metric title="Store credit used" value={money(analytics?.storeCreditRedeemed)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Create Gift Card</CardTitle>
            <CardDescription>Issue a digital gift card with an optional customer link.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Initial value" value={initialValue} onChange={(event) => setInitialValue(event.target.value)} />
            <Input type="date" value={expiry} onChange={(event) => setExpiry(event.target.value)} />
            <Input placeholder="Search customer (optional)" value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} />
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
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {giftCards.map((card) => (
                  <TableRow key={card.id} className="cursor-pointer" onClick={() => setSelectedCard(card)}>
                    <TableCell>{card.code}</TableCell>
                    <TableCell>{money(card.balance)}</TableCell>
                    <TableCell><Badge variant={card.isActive ? 'default' : 'secondary'}>{card.isActive ? 'Active' : 'Disabled'}</Badge></TableCell>
                    <TableCell>{card.customer?.name ?? 'Unassigned'}</TableCell>
                    <TableCell>{new Date(card.createdAt).toLocaleDateString()}</TableCell>
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
            <div className="grid gap-3 md:grid-cols-3">
              <Metric title="Balance" value={money(selectedCard.balance)} />
              <Metric title="Initial value" value={money(selectedCard.initialValue)} />
              <Metric title="Status" value={selectedCard.isActive ? 'Active' : 'Disabled'} />
            </div>
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
              <div className="grid gap-3 md:grid-cols-3">
                <Metric title="Customer" value={selectedCustomer.name} />
                <Metric title="Store credit balance" value={money(selectedCustomer.storeCreditBalance)} />
                <Metric title="Contact" value={selectedCustomer.email ?? selectedCustomer.phone ?? 'No contact'} />
              </div>
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

function TransactionList({ transactions }: { transactions: Array<{ id: string; amount: string; type: string; createdAt: string }> }) {
  return (
    <div className="space-y-2">
      {transactions.length ? transactions.map((transaction) => (
        <div key={transaction.id} className="flex justify-between rounded-md border p-3 text-sm">
          <span>{transaction.type}</span>
          <span>{money(transaction.amount)} - {new Date(transaction.createdAt).toLocaleString()}</span>
        </div>
      )) : <p className="text-sm text-muted-foreground">No transactions yet.</p>}
    </div>
  );
}
