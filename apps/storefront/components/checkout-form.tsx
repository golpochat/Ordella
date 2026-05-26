'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared-ui';
import {
  createOnlineOrder,
  fetchGiftCard,
  fetchCustomerAccount,
  fetchLoyaltyCustomer,
  fetchLoyaltySettings,
  quoteRouting,
  type RoutingQuote,
  type PublicGiftCard,
  type PublicLoyaltyCustomer,
  type StorefrontCustomerAddress,
} from '@/lib/api';
import { createCheckoutSession } from '@/lib/payments-api';
import { RecommendationSection } from '@/components/recommendation-section';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { basketSubtotal, calculateStorefrontTotals } from '@/lib/storefront-pricing';
import { createSubscriptionCheckoutSession } from '@/lib/subscriptions-api';
import { useBasketStore } from '@/stores/basket-store';

export function CheckoutForm() {
  const { settings, formatCurrency } = useTenantSettings();
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
  const [storeCreditAmount, setStoreCreditAmount] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [giftCardAmount, setGiftCardAmount] = useState('');
  const [giftCard, setGiftCard] = useState<PublicGiftCard | null>(null);
  const [accountCustomerId, setAccountCustomerId] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<StorefrontCustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loyaltySettings, setLoyaltySettings] = useState<{
    isEnabled: boolean;
    redeemRate: string;
    minRedeemPoints: number;
    maxRedeemPercent: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [routingQuote, setRoutingQuote] = useState<RoutingQuote | null>(null);
  const [routingLoading, setRoutingLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    void fetchLoyaltySettings().then(setLoyaltySettings).catch(() => setLoyaltySettings(null));
  }, []);

  useEffect(() => {
    void fetchCustomerAccount()
      .then((account) => {
        if (!account) {
          return;
        }
        setAccountCustomerId(account.id);
        setName(account.name);
        setEmail(account.email);
        setPhone(account.phone);
        setSavedAddresses(account.addresses ?? []);
        setLoyaltyCustomer({
          id: account.id,
          name: account.name,
          email: account.email,
          phone: account.phone,
          pointsBalance: account.pointsBalance ?? account.loyaltyPoints ?? 0,
          storeCreditBalance: account.storeCreditBalance ?? '0.00',
          lifetimeValue: '0.00',
        });
        const defaultAddress = account.addresses?.find((address) => address.isDefault);
        if (defaultAddress) {
          selectAddress(defaultAddress);
        }
      })
      .catch(() => {
        /* guest checkout remains available */
      });
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

  useEffect(() => {
    if (giftCardCode.trim().length < 4) {
      setGiftCard(null);
      return;
    }
    const timeout = window.setTimeout(() => {
      void fetchGiftCard(giftCardCode).then(setGiftCard).catch(() => setGiftCard(null));
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [giftCardCode]);

  useEffect(() => {
    if (orderType !== 'delivery' || !addressLine1.trim() || !city.trim() || lines.length === 0) {
      setRoutingQuote(null);
      return;
    }
    const timeout = window.setTimeout(() => {
      setRoutingLoading(true);
      void quoteRouting({
        orderType,
        customerAddress: {
          addressLine1: addressLine1.trim(),
          city: city.trim(),
          postalCode: postalCode.trim() || undefined,
        },
        items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
      })
        .then(setRoutingQuote)
        .catch(() => setRoutingQuote(null))
        .finally(() => setRoutingLoading(false));
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [addressLine1, city, lines, orderType, postalCode]);

  const subtotal = useMemo(() => basketSubtotal(lines), [lines]);
  const totals = useMemo(
    () => calculateStorefrontTotals(subtotal, {
      taxRate: Number(settings.defaultTaxRate) || 23,
      priceMode: 'inclusive',
    }),
    [settings.defaultTaxRate, subtotal],
  );
  const loyaltyDiscount = useMemo(() => {
    if (!loyaltyCustomer || !loyaltySettings?.isEnabled || !loyaltyRedeemPoints) return 0;
    const requested = Math.min(Number(loyaltyRedeemPoints), loyaltyCustomer.pointsBalance);
    if (requested < loyaltySettings.minRedeemPoints) return 0;
    const value = requested * Number(loyaltySettings.redeemRate);
    return Math.min(value, totals.total * (loyaltySettings.maxRedeemPercent / 100));
  }, [loyaltyCustomer, loyaltyRedeemPoints, loyaltySettings, totals.total]);
  const giftCardDiscount = useMemo(() => {
    if (!giftCard || !giftCardAmount) return 0;
    return Math.min(Number(giftCard.balance), Number(giftCardAmount), totals.total - loyaltyDiscount);
  }, [giftCard, giftCardAmount, loyaltyDiscount, totals.total]);
  const storeCreditDiscount = useMemo(() => {
    if (!loyaltyCustomer || !storeCreditAmount) return 0;
    return Math.min(
      Number(loyaltyCustomer.storeCreditBalance),
      Number(storeCreditAmount),
      totals.total - loyaltyDiscount - giftCardDiscount,
    );
  }, [giftCardDiscount, loyaltyCustomer, loyaltyDiscount, storeCreditAmount, totals.total]);
  const payableTotal = Math.max(0, totals.total - loyaltyDiscount - giftCardDiscount - storeCreditDiscount);
  const subscriptionLines = lines.filter((line) => line.purchaseType === 'subscription');
  const hasSubscriptionLines = subscriptionLines.length > 0;
  const cartProductIds = useMemo(() => lines.map((line) => line.productId), [lines]);

  function selectAddress(address: StorefrontCustomerAddress) {
    setSelectedAddressId(address.id);
    setAddressLine1(address.addressLine1);
    setAddressLine2(address.addressLine2 ?? '');
    setCity(address.city);
    setPostalCode(address.postalCode ?? '');
    setInstructions(address.instructions ?? '');
  }

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
    if (orderType === 'delivery') {
      try {
        const quote = await quoteRouting({
          orderType,
          customerAddress: {
            addressLine1: addressLine1.trim(),
            city: city.trim(),
            postalCode: postalCode.trim() || undefined,
          },
          items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
        });
        setRoutingQuote(quote);
        if (quote.canFulfill) {
          setLoading(true);
        } else {
          setError('Delivery is not available for this address or basket.');
          return;
        }
      } catch {
        setError('Delivery is not available for this address or basket.');
        return;
      }
    } else {
      setLoading(true);
    }
    try {
      const customer = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      };
      const items = lines.map((line) => ({
        itemId: line.productId,
        variantId: line.variantId,
        bundleId: line.bundleId,
        selectedBundleItemIds: line.selectedBundleItemIds,
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

      if (hasSubscriptionLines) {
        if (!accountCustomerId) {
          setError('Please sign in to create a subscription.');
          return;
        }
        if (subscriptionLines.length !== lines.length) {
          setError('Please check out subscription items separately from one-time items.');
          return;
        }
        if (paymentMethod !== 'card') {
          setError('Subscriptions require card checkout so future recurring orders can be processed.');
          return;
        }
        const schedule = subscriptionLines[0]?.subscriptionSchedule ?? 'weekly';
        if (subscriptionLines.some((line) => line.subscriptionSchedule !== schedule)) {
          setError('Please use one subscription schedule per checkout.');
          return;
        }
        const session = await createSubscriptionCheckoutSession({
          schedule,
          orderType: orderType === 'delivery' ? 'delivery' : 'pickup',
          totalPrice: payableTotal,
          deliveryDetails: delivery,
          items: subscriptionLines.map((line) => ({
            itemId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
            modifiers: { modifierOptionIds: line.modifierOptionIds ?? [] },
          })),
        });
        clearBasket();
        window.location.href = session.url;
        return;
      }

      if (paymentMethod === 'card' && payableTotal > 0) {
        const session = await createCheckoutSession({
          orderType,
          customerId: accountCustomerId ?? undefined,
          customer,
          items: items.map(({ itemId, variantId, bundleId, selectedBundleItemIds, modifiers, quantity }) => ({
            itemId,
            variantId,
            bundleId,
            selectedBundleItemIds,
            modifiers,
            quantity,
          })),
          notes: orderNotes.trim() || undefined,
          couponCode: couponCode.trim() || undefined,
          delivery,
          totals: {
            grandTotal: payableTotal.toFixed(2),
            subtotal: totals.subtotal.toFixed(2),
            taxTotal: totals.tax.toFixed(2),
          },
          loyaltyRedeemPoints: loyaltyRedeemPoints ? Number(loyaltyRedeemPoints) : undefined,
          giftCardCode: giftCardCode || undefined,
          giftCardAmount: giftCardAmount ? Number(giftCardAmount) : undefined,
          storeCreditAmount: storeCreditAmount ? Number(storeCreditAmount) : undefined,
        });
        window.location.href = session.url;
        return;
      }

      const order = await createOnlineOrder({
        orderType,
        paymentMethod: 'cash',
        customerId: accountCustomerId ?? undefined,
        customer,
        items,
        notes: orderNotes.trim() || undefined,
        couponCode: couponCode.trim() || undefined,
        delivery,
        loyaltyRedeemPoints: loyaltyRedeemPoints ? Number(loyaltyRedeemPoints) : undefined,
        giftCardCode: giftCardCode || undefined,
        giftCardAmount: giftCardAmount ? Number(giftCardAmount) : undefined,
        storeCreditAmount: storeCreditAmount ? Number(storeCreditAmount) : undefined,
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
      <div className="mx-auto max-w-xl px-[var(--theme-spacing)] py-[var(--storefront-section-padding)] text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-4 h-12 rounded-[var(--storefront-radius)]">
          <Link href="/catalog">Browse catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="mx-auto grid max-w-[var(--storefront-container)] gap-[var(--theme-spacing)] px-[var(--theme-spacing)] py-[var(--storefront-section-padding)] lg:grid-cols-5" onSubmit={onSubmit}>
      <div className="space-y-4 lg:col-span-3">
        <Card className="rounded-[var(--storefront-radius)]">
          <CardHeader>
            <CardTitle>Customer details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-[var(--storefront-card-padding)]">
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
            <Input
              placeholder="Coupon code (optional)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            {loyaltyCustomer && loyaltySettings?.isEnabled ? (
              <div className="rounded-[var(--storefront-radius)] border p-[var(--storefront-card-padding)] text-sm">
                <p className="font-medium">Rewards available</p>
                <p className="text-muted-foreground">{loyaltyCustomer.pointsBalance} points available</p>
                <p className="text-muted-foreground">Store credit: {formatCurrency(loyaltyCustomer.storeCreditBalance)}</p>
                <Input
                  className="mt-2"
                  placeholder={`Redeem points (minimum ${loyaltySettings.minRedeemPoints})`}
                  value={loyaltyRedeemPoints}
                  onChange={(e) => setLoyaltyRedeemPoints(e.target.value)}
                />
                <Input
                  className="mt-2"
                  placeholder="Store credit amount"
                  value={storeCreditAmount}
                  onChange={(e) => setStoreCreditAmount(e.target.value)}
                />
                {loyaltyDiscount > 0 ? (
                  <p className="mt-2 text-muted-foreground">
                    Discount applied: {formatCurrency(loyaltyDiscount)}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="rounded-[var(--storefront-radius)] border p-[var(--storefront-card-padding)] text-sm">
              <p className="font-medium">Gift card</p>
              <Input
                className="mt-2"
                placeholder="Gift card code"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value)}
              />
              {giftCard ? (
                <>
                  <p className="mt-2 text-muted-foreground">
                    Balance: {formatCurrency(giftCard.balance)}
                  </p>
                  <Input
                    className="mt-2"
                    placeholder="Gift card amount"
                    value={giftCardAmount}
                    onChange={(e) => setGiftCardAmount(e.target.value)}
                  />
                  {giftCardDiscount > 0 ? (
                    <p className="mt-2 text-muted-foreground">
                      Gift card applied: {formatCurrency(giftCardDiscount)}
                    </p>
                  ) : null}
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[var(--storefront-radius)]">
          <CardHeader>
            <CardTitle>Order type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-[var(--storefront-card-padding)]">
            <Tabs
              value={orderType}
              onValueChange={(v) => setOrderType(v as typeof orderType)}
            >
              <TabsList className="grid h-12 grid-cols-3 rounded-[var(--storefront-radius)]">
                <TabsTrigger value="pickup">Pickup</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
                <TabsTrigger value="in_store">In-store</TabsTrigger>
              </TabsList>
              <TabsContent value="delivery" className="mt-4 space-y-3">
                {savedAddresses.length ? (
                  <div className="space-y-1">
                    <label htmlFor="saved-address" className="text-sm font-medium">
                      Saved address
                    </label>
                    <select
                      id="saved-address"
                      className="h-11 w-full rounded-[var(--storefront-radius)] border border-input bg-background px-3 text-sm"
                      value={selectedAddressId}
                      onChange={(event) => {
                        const address = savedAddresses.find((item) => item.id === event.target.value);
                        if (address) selectAddress(address);
                      }}
                    >
                      <option value="">Enter a new address</option>
                      {savedAddresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.label} · {address.addressLine1}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
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

        <Card className="rounded-[var(--storefront-radius)]">
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="p-[var(--storefront-card-padding)]">
            {hasSubscriptionLines ? (
              <p className="mb-3 rounded-[var(--storefront-radius)] border p-3 text-sm text-muted-foreground">
                Subscription checkout saves a card for future recurring orders.
              </p>
            ) : null}
            <Tabs
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
            >
              <TabsList className="grid h-12 grid-cols-2 rounded-[var(--storefront-radius)]">
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

      <Card className="h-fit rounded-[var(--storefront-radius)] lg:sticky lg:top-24 lg:col-span-2">
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-[var(--storefront-card-padding)]">
          <p className="rounded-[var(--storefront-radius)] bg-muted p-3 text-sm text-muted-foreground">
            {routingLoading
              ? 'Checking delivery availability…'
              : routingQuote?.canFulfill
                ? `Fulfilled by: ${routingQuote.selectedLocationName ?? 'assigned location'} · ETA ${routingQuote.estimatedDeliveryMinutes ?? 'n/a'} min`
                : orderType === 'delivery'
                  ? 'Enter your delivery address to confirm availability and ETA.'
                  : 'Delivery orders may be fulfilled by the nearest location with stock.'}
          </p>
          <ul className="space-y-2 text-sm">
            {lines.map((line) => (
              <li key={line.lineId} className="flex justify-between gap-2">
                <span>
                  {line.quantity}× {line.name}
                  {line.variantName ? ` (${line.variantName})` : ''}
                  {line.purchaseType === 'subscription' ? ` · ${line.subscriptionSchedule}` : ''}
                </span>
                <span>{formatCurrency(line.unitPrice * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.taxBreakdown.map((line) => (
              <div key={line.taxName} className="flex justify-between">
                <span>{line.taxName} ({line.taxRate.toFixed(2)}%, {line.priceMode} est.)</span>
                <span>{formatCurrency(line.taxAmount)}</span>
              </div>
            ))}
            {giftCardDiscount > 0 ? (
              <div className="flex justify-between text-muted-foreground">
                <span>Gift card</span>
                <span>-{formatCurrency(giftCardDiscount)}</span>
              </div>
            ) : null}
            {storeCreditDiscount > 0 ? (
              <div className="flex justify-between text-muted-foreground">
                <span>Store credit</span>
                <span>-{formatCurrency(storeCreditDiscount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between font-semibold">
              <span>Total (est.)</span>
              <span>{formatCurrency(payableTotal)}</span>
            </div>
          </div>
          <RecommendationSection
            title="Recommended add-ons"
            source="checkout_recommended_addons"
            itemIds={cartProductIds}
            customerId={accountCustomerId ?? undefined}
            mode="cart"
            limit={3}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="h-12 w-full rounded-[var(--storefront-radius)] text-base" disabled={loading}>
            {loading
              ? paymentMethod === 'card'
                ? 'Redirecting to payment…'
                : 'Placing order…'
              : hasSubscriptionLines
                ? 'Confirm subscription'
                : paymentMethod === 'card'
                ? 'Pay with card'
                : 'Place order'}
          </Button>
          <Button asChild type="button" variant="outline" className="h-11 w-full rounded-[var(--storefront-radius)]">
            <Link href="/cart">Back to cart</Link>
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
