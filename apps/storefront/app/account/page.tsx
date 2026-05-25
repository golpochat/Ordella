'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import {
  fetchCustomerGiftCards,
  fetchLoyaltyCustomer,
  fetchStoreCreditHistory,
  type PublicCreditTransaction,
  type PublicGiftCard,
  type PublicLoyaltyCustomer,
} from '@/lib/api';

export default function AccountPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState<PublicLoyaltyCustomer | null>(null);
  const [giftCards, setGiftCards] = useState<PublicGiftCard[]>([]);
  const [storeCreditHistory, setStoreCreditHistory] = useState<PublicCreditTransaction[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function lookup() {
    setMessage(null);
    const result = await fetchLoyaltyCustomer({ email: email.trim() || undefined, phone: phone.trim() || undefined });
    setCustomer(result);
    if (result) {
      const [cards, history] = await Promise.all([
        fetchCustomerGiftCards(result.id),
        fetchStoreCreditHistory(result.id),
      ]);
      setGiftCards(cards);
      setStoreCreditHistory(history);
    }
    if (!result) setMessage('No rewards profile found yet. Place an order to start earning points.');
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Rewards & Store Credit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Input placeholder="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </div>
          <Button type="button" onClick={() => void lookup()}>View rewards</Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          {customer ? (
            <div className="grid gap-3 md:grid-cols-3">
              <Metric title="Points balance" value={customer.pointsBalance} />
              <Metric title="Store credit" value={customer.storeCreditBalance} />
              <Metric title="Lifetime value" value={customer.lifetimeValue} />
            </div>
          ) : null}
          {giftCards.length ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Linked gift cards</p>
              {giftCards.map((card) => (
                <div key={card.id} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{card.code}</p>
                  <p className="text-muted-foreground">Balance: {card.balance} {card.currency}</p>
                </div>
              ))}
            </div>
          ) : null}
          {storeCreditHistory.length ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Store credit history</p>
              {storeCreditHistory.map((transaction) => (
                <div key={transaction.id} className="flex justify-between rounded-md border p-3 text-sm">
                  <span>{transaction.type}</span>
                  <span>{transaction.amount}</span>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
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
