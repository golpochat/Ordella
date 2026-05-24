'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared-ui';
import { submitCheckout } from '@/lib/api';
import { saveCheckoutPreview } from '@/lib/checkout-storage';
import { useBasketStore } from '@/stores/basket-store';

export function CheckoutForm() {
  const router = useRouter();
  const sessionId = useBasketStore((s) => s.sessionId);
  const items = useBasketStore((s) => s.items);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('pickup');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sessionId || items.length === 0) {
      setError('Your basket is empty');
      return;
    }

    if (orderType === 'delivery' && (!addressLine1.trim() || !city.trim())) {
      setError('Delivery address and city are required');
      return;
    }

    setLoading(true);
    try {
      const result = await submitCheckout({
        sessionId,
        orderType,
        customer: { name, phone, email },
        couponCode: couponCode || undefined,
        delivery:
          orderType === 'delivery'
            ? {
                addressLine1,
                addressLine2: addressLine2 || undefined,
                city,
                postalCode: postalCode || undefined,
                instructions: instructions || undefined,
                contactPhone: phone,
              }
            : undefined,
        paymentMethod: 'card',
      });
      saveCheckoutPreview(result);
      router.push(`/checkout?step=payment&sessionId=${result.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mx-auto grid max-w-5xl gap-4 px-4 py-6 md:grid-cols-2" onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Customer details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Coupon code (optional)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'delivery' | 'pickup')}>
            <TabsList className="grid h-12 grid-cols-2">
              <TabsTrigger value="pickup" className="text-base">
                Pickup
              </TabsTrigger>
              <TabsTrigger value="delivery" className="text-base">
                Delivery
              </TabsTrigger>
            </TabsList>
            <TabsContent value="delivery" className="mt-4 space-y-3">
              <Input
                placeholder="Address line 1"
                required={orderType === 'delivery'}
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
              />
              <Input
                placeholder="Address line 2 (optional)"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
              <Input
                placeholder="City"
                required={orderType === 'delivery'}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Input
                placeholder="Postal code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
              <Input
                placeholder="Delivery instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </TabsContent>
          </Tabs>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="submit" className="h-12 flex-1" disabled={loading}>
              {loading ? 'Preparing…' : 'Continue to payment'}
            </Button>
            <Button asChild type="button" variant="outline" className="h-12">
              <Link href="/basket">Back</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
