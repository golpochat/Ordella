'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { completeCheckoutSession } from '@/lib/payments-api';
import { useBasketStore } from '@/stores/basket-store';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clearBasket = useBasketStore((s) => s.clearBasket);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('Missing payment session');
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const result = await completeCheckoutSession(sessionId);
        if (cancelled) return;
        clearBasket();
        setOrderId(result.orderId);
        router.replace(`/order/${result.orderId}?confirmed=1`);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not confirm payment');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, clearBasket, router]);

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Order payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {!error && !orderId ? (
            <p className="text-muted-foreground">Confirming your payment…</p>
          ) : null}
          {error ? <p className="text-destructive">{error}</p> : null}
          {orderId ? (
            <p className="text-muted-foreground">Redirecting to your order…</p>
          ) : null}
          <Button asChild variant="outline" className="h-11">
            <Link href="/catalog">Continue shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<p className="px-4 py-12 text-center text-sm text-muted-foreground">Confirming your payment...</p>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
