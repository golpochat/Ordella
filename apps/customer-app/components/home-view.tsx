'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { fetchCustomerOrders } from '@/lib/api';
import { getStorefrontUrl } from '@/lib/config';
import { getLastOrderId } from '@/lib/session';

const RECOMMENDED = [
  { name: 'Organic apples (1 kg)', note: 'Grocery pick' },
  { name: 'Flat white', note: 'Café favourite' },
  { name: 'Classic crew tee', note: 'Retail bestseller' },
];

export function HomeView() {
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [lastOrderLabel, setLastOrderLabel] = useState<string | null>(null);

  useEffect(() => {
    const stored = getLastOrderId();
    if (stored) {
      setLastOrderId(stored);
    }

    void fetchCustomerOrders('past')
      .then((orders) => {
        const latest = orders[0];
        if (latest) {
          setLastOrderId(latest.id);
          setLastOrderLabel(latest.orderNumber ?? latest.id.slice(0, 8));
        }
      })
      .catch(() => {
        /* orders endpoint may be unimplemented */
      });
  }, []);

  const catalogUrl = `${getStorefrontUrl()}/menu`;

  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Retail ordering from your favourite businesses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick reorder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lastOrderId ? (
            <>
              <p className="text-sm text-muted-foreground">
                Last order: {lastOrderLabel ?? lastOrderId.slice(0, 8)}
              </p>
              <Button asChild>
                <Link href={`/orders/${lastOrderId}`}>View & reorder</Link>
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No previous orders yet.</p>
          )}
          <Button asChild variant="outline">
            <a href={catalogUrl}>Browse catalog</a>
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Recommended for you</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {RECOMMENDED.map((item) => (
            <Card key={item.name}>
              <CardContent className="p-4">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.note} · placeholder</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
