'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared-ui';
import { useCartStore } from '@/stores/cart-store';
import { checkoutCart } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const cartId = useCartStore((s) => s.cartId);
  const [customerId, setCustomerId] = useState('');
  const [promotionCode, setPromotionCode] = useState('');
  const [method, setMethod] = useState<'cash' | 'card' | 'pos'>('cash');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const submitCheckout = async () => {
    if (!items.length || !cartId) {
      setError('Cannot checkout an empty cart');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const checkout = await checkoutCart(cartId, customerId || undefined);
      const params = new URLSearchParams({
        orderId: checkout.orderId,
        method,
      });
      if (promotionCode) params.set('promotionCode', promotionCode);
      router.push(`/payment?${params.toString()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-4 p-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Lines: {items.length}</p>
          <p>Quantity: {totalItems}</p>
          <p className="text-muted-foreground">Promotions are applied server-side during checkout/payment policies.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checkout options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Customer ID (optional)"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          />
          <Input
            placeholder="Promotion code (optional)"
            value={promotionCode}
            onChange={(e) => setPromotionCode(e.target.value)}
          />
          <Tabs value={method} onValueChange={(v) => setMethod(v as 'cash' | 'card' | 'pos')}>
            <TabsList className="grid h-12 grid-cols-3">
              <TabsTrigger className="text-base" value="cash">Cash</TabsTrigger>
              <TabsTrigger className="text-base" value="card">Card</TabsTrigger>
              <TabsTrigger className="text-base" value="pos">Terminal</TabsTrigger>
            </TabsList>
            <TabsContent value="cash" />
            <TabsContent value="card" />
            <TabsContent value="pos" />
          </Tabs>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <Button className="h-12 text-base" disabled={loading} onClick={submitCheckout}>
              Continue to payment
            </Button>
            <Button asChild variant="outline" className="h-12 text-base">
              <Link href="/cart">Back to cart</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
