'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import { fetchLoyaltyCustomer, type PublicLoyaltyCustomer } from '@/lib/api';

export default function AccountPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState<PublicLoyaltyCustomer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function lookup() {
    setMessage(null);
    const result = await fetchLoyaltyCustomer({ email: email.trim() || undefined, phone: phone.trim() || undefined });
    setCustomer(result);
    if (!result) setMessage('No rewards profile found yet. Place an order to start earning points.');
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Rewards</CardTitle>
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
              <Metric title="Lifetime value" value={customer.lifetimeValue} />
              <Metric title="Rewards available" value={customer.pointsBalance > 0 ? 'Ready to redeem' : 'Start earning'} />
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
