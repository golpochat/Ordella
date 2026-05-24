'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { payOrder } from '@/lib/api';
import { useCartStore } from '@/stores/cart-store';

export function PaymentScreen({
  orderId,
  method,
}: {
  orderId?: string;
  method: 'cash' | 'card' | 'pos';
}) {
  const clearCart = useCartStore((s) => s.clearCart);
  const [state, setState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [message, setMessage] = useState<string>('');

  const capture = async () => {
    if (!orderId) return;
    setState('processing');
    setMessage('');
    try {
      const result = await payOrder(orderId, method);
      setState('success');
      setMessage(`Payment ${result.status} (${result.paymentStatus})`);
      clearCart();
    } catch (e) {
      setState('failed');
      setMessage(e instanceof Error ? e.message : 'Payment failed');
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Order: {orderId ?? 'missing'}</p>
          <p>Method: {method}</p>
          <Button className="h-14 text-lg" disabled={!orderId || state === 'processing'} onClick={capture}>
            {state === 'processing' ? 'Processing…' : 'Capture payment'}
          </Button>
          {state === 'success' ? <p className="text-green-600">{message}</p> : null}
          {state === 'failed' ? <p className="text-destructive">{message}</p> : null}
          {state === 'success' && orderId ? (
            <Button asChild variant="secondary" className="h-12">
              <Link href={`/receipt?orderId=${orderId}`}>View receipt</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
      <div className="mt-4">
        <Button asChild variant="outline">
          <Link href="/checkout">Back</Link>
        </Button>
      </div>
    </div>
  );
}
