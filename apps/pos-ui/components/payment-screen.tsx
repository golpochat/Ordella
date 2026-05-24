'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import {
  confirmTerminalPayment,
  createTerminalPaymentIntent,
  payOrder,
} from '@/lib/api';
import { useCartStore } from '@/stores/cart-store';

export function PaymentScreen({
  orderId,
  method,
}: {
  orderId?: string;
  method: 'cash' | 'card' | 'pos' | 'external';
}) {
  const clearCart = useCartStore((s) => s.clearCart);
  const [state, setState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [message, setMessage] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

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

  const startCardPayment = async () => {
    if (!orderId) return;
    setState('processing');
    setMessage('');
    try {
      const intent = await createTerminalPaymentIntent(orderId);
      setPaymentIntentId(intent.paymentIntentId);
      if (!intent.clientSecret) {
        await confirmTerminalPayment(orderId, intent.paymentIntentId);
        const result = await payOrder(orderId, 'card', intent.paymentIntentId);
        setState('success');
        setMessage(`Payment ${result.status} (${result.paymentStatus})`);
        clearCart();
        return;
      }
      setState('idle');
      setMessage(
        'Payment intent ready. Confirm on your connected card reader, then tap Complete card payment.',
      );
    } catch (e) {
      setState('failed');
      setMessage(e instanceof Error ? e.message : 'Could not start card payment');
    }
  };

  const completeCardPayment = async () => {
    if (!orderId || !paymentIntentId) return;
    setState('processing');
    setMessage('');
    try {
      await confirmTerminalPayment(orderId, paymentIntentId);
      const result = await payOrder(orderId, 'card', paymentIntentId);
      setState('success');
      setMessage(`Payment ${result.status} (${result.paymentStatus})`);
      clearCart();
    } catch (e) {
      setState('failed');
      setMessage(e instanceof Error ? e.message : 'Payment failed');
    }
  };

  const isCard = method === 'card';

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Order payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Order: {orderId ?? 'missing'}</p>
          <p>Method: {method === 'external' ? 'External card' : method}</p>
          {isCard ? (
            <>
              <Button
                className="h-14 text-lg"
                disabled={!orderId || state === 'processing'}
                onClick={paymentIntentId ? completeCardPayment : startCardPayment}
              >
                {state === 'processing'
                  ? 'Processing…'
                  : paymentIntentId
                    ? 'Complete card payment'
                    : 'Connect reader & collect card'}
              </Button>
              <p className="text-sm text-muted-foreground">
                Stripe Terminal MVP: create a payment intent, collect on your reader, then complete.
              </p>
            </>
          ) : (
            <Button
              className="h-14 text-lg"
              disabled={!orderId || state === 'processing'}
              onClick={capture}
            >
              {state === 'processing' ? 'Processing…' : 'Capture payment'}
            </Button>
          )}
          {message ? (
            <p className={state === 'failed' ? 'text-destructive' : 'text-muted-foreground'}>
              {message}
            </p>
          ) : null}
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
