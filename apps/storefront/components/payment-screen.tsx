'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { submitPayment } from '@/lib/api';
import { clearCheckoutPreview, loadCheckoutPreview } from '@/lib/checkout-storage';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { useBasketStore } from '@/stores/basket-store';

export function PaymentScreen({ sessionId }: { sessionId: string }) {
  const { formatCurrency } = useTenantSettings();
  const router = useRouter();
  const clearBasket = useBasketStore((s) => s.clearBasket);
  const preview = loadCheckoutPreview();
  const [state, setState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [message, setMessage] = useState('');

  const pay = async () => {
    setState('processing');
    setMessage('');
    try {
      const result = await submitPayment({ sessionId, method: 'card' });
      setState('success');
      setMessage(`Payment ${result.paymentStatus}`);
      clearBasket();
      clearCheckoutPreview();
      router.push(`/order/${result.orderId}`);
    } catch (e) {
      setState('failed');
      setMessage(e instanceof Error ? e.message : 'Payment failed');
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {preview ? (
            <div className="space-y-1 text-sm">
              <p>Subtotal: {formatCurrency(preview.totals.subtotal)}</p>
              <p>Discount: -{formatCurrency(preview.totals.discountTotal)}</p>
              <p>Tax: {formatCurrency(preview.totals.taxTotal)}</p>
              <p>Delivery: {formatCurrency(preview.totals.deliveryFee)}</p>
              <p className="text-lg font-semibold">Total: {formatCurrency(preview.totals.grandTotal)}</p>
            </div>
          ) : null}
          <Button className="h-12 w-full text-base" disabled={state === 'processing'} onClick={pay}>
            {state === 'processing' ? 'Processing…' : 'Pay now'}
          </Button>
          {state === 'failed' ? <p className="text-sm text-destructive">{message}</p> : null}
          <Button asChild variant="outline" className="h-12 w-full">
            <Link href="/checkout">Back to checkout</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
