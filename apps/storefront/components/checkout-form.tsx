'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared-ui';
import { createOnlineOrder } from '@/lib/api';
import { basketSubtotal, calculateStorefrontTotals, formatMoney } from '@/lib/storefront-pricing';
import { useBasketStore } from '@/stores/basket-store';

export function CheckoutForm() {
  const router = useRouter();
  const lines = useBasketStore((s) => s.lines);
  const hydrate = useBasketStore((s) => s.hydrate);
  const clearBasket = useBasketStore((s) => s.clearBasket);

  const [orderType, setOrderType] = useState<'pickup' | 'delivery' | 'in_store'>('pickup');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [instructions, setInstructions] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const subtotal = useMemo(() => basketSubtotal(lines), [lines]);
  const totals = useMemo(() => calculateStorefrontTotals(subtotal), [subtotal]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (lines.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (orderType === 'delivery' && (!addressLine1.trim() || !city.trim())) {
      setError('Delivery address and city are required');
      return;
    }

    setLoading(true);
    try {
      const order = await createOnlineOrder({
        orderType,
        paymentMethod: 'cash',
        customer: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
        },
        items: lines.map((line) => ({
          itemId: line.productId,
          variantId: line.variantId,
          modifiers: line.modifierOptionIds,
          quantity: line.quantity,
          price: line.unitPrice.toFixed(2),
        })),
        notes: orderNotes.trim() || undefined,
        delivery:
          orderType === 'delivery'
            ? {
                addressLine1: addressLine1.trim(),
                addressLine2: addressLine2.trim() || undefined,
                city: city.trim(),
                postalCode: postalCode.trim() || undefined,
                instructions: instructions.trim() || undefined,
              }
            : undefined,
      });
      clearBasket();
      router.push(`/order/${order.id}?confirmed=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place order');
    } finally {
      setLoading(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-4 h-12">
          <Link href="/catalog">Browse catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-5" onSubmit={onSubmit}>
      <div className="space-y-4 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Customer details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Name *" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Phone *" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input
              type="email"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Order notes (optional)"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              value={orderType}
              onValueChange={(v) => setOrderType(v as typeof orderType)}
            >
              <TabsList className="grid h-12 grid-cols-3">
                <TabsTrigger value="pickup">Pickup</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
                <TabsTrigger value="in_store">In-store</TabsTrigger>
              </TabsList>
              <TabsContent value="delivery" className="mt-4 space-y-3">
                <Input
                  placeholder="Address line 1 *"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                />
                <Input
                  placeholder="Address line 2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                />
                <Input placeholder="City *" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input
                  placeholder="Postcode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
                <Input
                  placeholder="Delivery notes"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cash on delivery / pay on pickup (MVP). Card payments via Stripe can be enabled later.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit lg:col-span-2">
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm">
            {lines.map((line) => (
              <li key={line.lineId} className="flex justify-between gap-2">
                <span>
                  {line.quantity}× {line.name}
                  {line.variantName ? ` (${line.variantName})` : ''}
                </span>
                <span>${formatMoney(line.unitPrice * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${formatMoney(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (est.)</span>
              <span>${formatMoney(totals.tax)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total (est.)</span>
              <span>${formatMoney(totals.total)}</span>
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="h-12 w-full text-base" disabled={loading}>
            {loading ? 'Placing order…' : 'Place order'}
          </Button>
          <Button asChild type="button" variant="outline" className="h-11 w-full">
            <Link href="/cart">Back to cart</Link>
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
