'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared-ui';
import {
  createOnlineOrder,
  fetchLoyaltyCustomer,
  fetchLoyaltySettings,
  type PublicLoyaltyCustomer,
} from '@/lib/api';
import { createCheckoutSession } from '@/lib/payments-api';
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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [loyaltyCustomer, setLoyaltyCustomer] = useState<PublicLoyaltyCustomer | null>(null);
  const [loyaltyRedeemPoints, setLoyaltyRedeemPoints] = useState('');
  const [loyaltySettings, setLoyaltySettings] = useState<{
    isEnabled: boolean;
    redeemRate: string;
    minRedeemPoints: number;
    maxRedeemPercent: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    void fetchLoyaltySettings().then(setLoyaltySettings).catch(() => setLoyaltySettings(null));
  }, []);

  useEffect(() => {
    const term = email.trim() || phone.trim();
    if (term.length < 3) {
      setLoyaltyCustomer(null);
      return;
    }
    const timeout = window.setTimeout(() => {
      void fetchLoyaltyCustomer({ email: email.trim() || undefined, phone: phone.trim() || undefined })
        .then(setLoyaltyCustomer)
        .catch(() => setLoyaltyCustomer(null));
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [email, phone]);

  const subtotal = useMemo(() => basketSubtotal(lines), [lines]);
  const totals = useMemo(() => calculateStorefrontTotals(subtotal), [subtotal]);
  const loyaltyDiscount = useMemo(() => {
    if (!loyaltyCustomer || !loyaltySettings?.isEnabled || !loyaltyRedeemPoints) return 0;
    const requested = Math.min(Number(loyaltyRedeemPoints), loyaltyCustomer.pointsBalance);
    if (requested < loyaltySettings.minRedeemPoints) return 0;
    const value = requested * Number(loyaltySettings.redeemRate);
    return Math.min(value, totals.total * (loyaltySettings.maxRedeemPercent / 100));
  }, [loyaltyCustomer, loyaltyRedeemPoints, loyaltySettings, totals.total]);
  const payableTotal = Math.max(0, totals.total - loyaltyDiscount);

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
      const customer = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      };
      const items = lines.map((line) => ({
        itemId: line.productId,
        variantId: line.variantId,
        modifiers: line.modifierOptionIds,
        quantity: line.quantity,
        price: line.unitPrice.toFixed(2),
      }));
      const delivery =
        orderType === 'delivery'
          ? {
              addressLine1: addressLine1.trim(),
              addressLine2: addressLine2.trim() || undefined,
              city: city.trim(),
              postalCode: postalCode.trim() || undefined,
              instructions: instructions.trim() || undefined,
            }
          : undefined;

      if (paymentMethod === 'card') {
        const session = await createCheckoutSession({
          orderType,
          customer,
          items: items.map(({ itemId, variantId, modifiers, quantity }) => ({
            itemId,
            variantId,
            modifiers,
            quantity,
          })),
          notes: orderNotes.trim() || undefined,
          delivery,
          totals: {
            grandTotal: payableTotal.toFixed(2),
            subtotal: totals.subtotal.toFixed(2),
            taxTotal: totals.tax.toFixed(2),
          },
          loyaltyRedeemPoints: loyaltyRedeemPoints ? Number(loyaltyRedeemPoints) : undefined,
        });
        window.location.href = session.url;
        return;
      }

      const order = await createOnlineOrder({
        orderType,
        paymentMethod: 'cash',
        customer,
        items,
        notes: orderNotes.trim() || undefined,
        delivery,
        loyaltyRedeemPoints: loyaltyRedeemPoints ? Number(loyaltyRedeemPoints) : undefined,
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
            {loyaltyCustomer && loyaltySettings?.isEnabled ? (
              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium">Rewards available</p>
                <p className="text-muted-foreground">{loyaltyCustomer.pointsBalance} points available</p>
                <Input
                  className="mt-2"
                  placeholder={`Redeem points (minimum ${loyaltySettings.minRedeemPoints})`}
                  value={loyaltyRedeemPoints}
                  onChange={(e) => setLoyaltyRedeemPoints(e.target.value)}
                />
                {loyaltyDiscount > 0 ? (
                  <p className="mt-2 text-muted-foreground">
                    Discount applied: {formatMoney(loyaltyDiscount)}
                  </p>
                ) : null}
              </div>
            ) : null}
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
            <Tabs
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
            >
              <TabsList className="grid h-12 grid-cols-2">
                <TabsTrigger value="cash">Cash</TabsTrigger>
                <TabsTrigger value="card">Card</TabsTrigger>
              </TabsList>
              <TabsContent value="cash" className="mt-3 text-sm text-muted-foreground">
                Pay with cash on pickup or delivery.
              </TabsContent>
              <TabsContent value="card" className="mt-3 text-sm text-muted-foreground">
                Pay securely online with card (Stripe Checkout).
              </TabsContent>
            </Tabs>
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
              <span>${formatMoney(payableTotal)}</span>
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="h-12 w-full text-base" disabled={loading}>
            {loading
              ? paymentMethod === 'card'
                ? 'Redirecting to payment…'
                : 'Placing order…'
              : paymentMethod === 'card'
                ? 'Pay with card'
                : 'Place order'}
          </Button>
          <Button asChild type="button" variant="outline" className="h-11 w-full">
            <Link href="/cart">Back to cart</Link>
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
