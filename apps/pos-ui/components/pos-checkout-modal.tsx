'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared-ui';
import {
  checkoutCart,
  completeSale,
  fetchLoyaltyCustomerOrders,
  lookupGiftCard,
  searchLoyaltyCustomers,
  updateCustomerCrm,
  type PosCustomerOrder,
  type PosGiftCard,
  type PosLoyaltyCustomer,
} from '@/lib/api';
import { enqueueOfflineSale } from '@/lib/offline-queue';
import { useCartStore } from '@/stores/cart-store';

type PosCheckoutModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  online: boolean;
};

export function PosCheckoutModal({ open, onOpenChange, online }: PosCheckoutModalProps) {
  const router = useRouter();
  const cartId = useCartStore((s) => s.cartId);
  const clearCart = useCartStore((s) => s.clearCart);
  const discountPercent = useCartStore((s) => s.discountPercent);
  const discountFixed = useCartStore((s) => s.discountFixed);
  const [orderType, setOrderType] = useState<'pos' | 'pickup' | 'delivery'>('pos');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'external'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<PosLoyaltyCustomer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<PosCustomerOrder[]>([]);
  const [customerTags, setCustomerTags] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [loyaltyRedeemPoints, setLoyaltyRedeemPoints] = useState('');
  const [storeCreditAmount, setStoreCreditAmount] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [giftCardAmount, setGiftCardAmount] = useState('');
  const [giftCard, setGiftCard] = useState<PosGiftCard | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const term = customerPhone.trim() || customerEmail.trim();
    if (term.length < 3) {
      setSelectedCustomer(null);
      return;
    }
    const timeout = window.setTimeout(async () => {
      try {
        const [match = null] = await searchLoyaltyCustomers(term);
        setSelectedCustomer(match);
        if (match) {
          setCustomerName(match.name);
          setCustomerPhone(match.phone ?? customerPhone);
          setCustomerEmail(match.email ?? customerEmail);
          setCustomerTags((match.tags ?? []).join(', '));
          setCustomerNotes(match.staffNotes ?? '');
        }
      } catch {
        setSelectedCustomer(null);
      }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [customerEmail, customerPhone, open]);

  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerOrders([]);
      setCustomerTags('');
      setCustomerNotes('');
      return;
    }
    void fetchLoyaltyCustomerOrders(selectedCustomer.id)
      .then((orders) => setCustomerOrders(orders.slice(0, 5)))
      .catch(() => setCustomerOrders([]));
  }, [selectedCustomer]);

  useEffect(() => {
    if (!open || giftCardCode.trim().length < 4) {
      setGiftCard(null);
      return;
    }
    const timeout = window.setTimeout(async () => {
      try {
        setGiftCard(await lookupGiftCard(giftCardCode));
      } catch {
        setGiftCard(null);
      }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [giftCardCode, open]);

  const confirm = async () => {
    if (!cartId) {
      setError('Cart is empty');
      return;
    }
    setLoading(true);
    setError(null);

    const payload: Parameters<typeof completeSale>[0] = {
      cartId,
      orderType,
      paymentMethod,
      orderNotes: orderNotes || undefined,
      customer:
        customerName || customerPhone || customerEmail || selectedCustomer
          ? { name: customerName || undefined, phone: customerPhone || undefined }
          : undefined,
      loyaltyRedeemPoints: loyaltyRedeemPoints ? Number(loyaltyRedeemPoints) : undefined,
      giftCardCode: giftCardCode || undefined,
      giftCardAmount: giftCardAmount ? Number(giftCardAmount) : undefined,
      storeCreditAmount: storeCreditAmount ? Number(storeCreditAmount) : undefined,
      couponCode: couponCode || undefined,
      discountPercent: discountPercent || undefined,
      discountFixed: discountFixed || undefined,
    };

    if (payload.customer) {
      payload.customer.email = customerEmail || undefined;
      payload.customer.customerId = selectedCustomer?.id;
    }

    if (!online) {
      enqueueOfflineSale(payload);
      clearCart();
      onOpenChange(false);
      setLoading(false);
      setError('Order queued offline. Sync when back online.');
      return;
    }

    try {
      if (paymentMethod === 'card') {
        const checkout = await checkoutCart(cartId, {
          customerId: selectedCustomer?.id,
          couponCode: couponCode || undefined,
          discountPercent: discountPercent || undefined,
          discountFixed: discountFixed || undefined,
        });
        onOpenChange(false);
        router.push(`/payment?orderId=${checkout.orderId}&method=card`);
        return;
      }

      const result = await completeSale(payload);
      clearCart();
      onOpenChange(false);
      router.push(`/receipt?orderId=${result.orderId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const saveCustomerCrm = async () => {
    if (!selectedCustomer) return;
    setError(null);
    try {
      const updated = await updateCustomerCrm({
        customerId: selectedCustomer.id,
        tags: customerTags.split(',').map((tag) => tag.trim()).filter(Boolean),
        notes: customerNotes,
      });
      setSelectedCustomer(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save customer notes');
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle>Checkout</ModalTitle>
        </ModalHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="mb-2 text-sm font-medium">Order type</p>
            <Tabs value={orderType} onValueChange={(v) => setOrderType(v as typeof orderType)}>
              <TabsList className="grid h-12 grid-cols-3">
                <TabsTrigger value="pos" className="text-sm">
                  In-store
                </TabsTrigger>
                <TabsTrigger value="pickup" className="text-sm">
                  Pickup
                </TabsTrigger>
                <TabsTrigger value="delivery" className="text-sm">
                  Delivery
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pos" />
              <TabsContent value="pickup" />
              <TabsContent value="delivery" />
            </Tabs>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Payment</p>
            <Tabs
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
            >
              <TabsList className="grid h-12 grid-cols-3">
                <TabsTrigger value="cash">Cash</TabsTrigger>
                <TabsTrigger value="card">Card</TabsTrigger>
                <TabsTrigger value="external">External</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Input
            placeholder="Customer name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <Input
            placeholder="Customer phone (optional)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Customer email (optional)"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
          {selectedCustomer ? (
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">{selectedCustomer.name}</p>
              <p className="text-muted-foreground">{selectedCustomer.pointsBalance} points available</p>
              <p className="text-muted-foreground">Store credit: {selectedCustomer.storeCreditBalance}</p>
              <p className="text-muted-foreground">Lifetime value: {selectedCustomer.lifetimeValue}</p>
              <p className="text-muted-foreground">
                Last order: {selectedCustomer.lastOrderAt ? new Date(selectedCustomer.lastOrderAt).toLocaleDateString() : 'No orders'}
              </p>
              {selectedCustomer.tags?.length ? (
                <p className="text-muted-foreground">Tags: {selectedCustomer.tags.join(', ')}</p>
              ) : null}
              {selectedCustomer.staffNotes ? (
                <p className="text-muted-foreground">Notes: {selectedCustomer.staffNotes}</p>
              ) : null}
              <Input
                className="mt-2"
                placeholder="Customer tags, comma separated"
                value={customerTags}
                onChange={(e) => setCustomerTags(e.target.value)}
              />
              <Input
                className="mt-2"
                placeholder="Customer notes"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
              />
              <Button type="button" variant="outline" className="mt-2" onClick={() => void saveCustomerCrm()}>
                Save customer CRM
              </Button>
              {customerOrders.length ? (
                <div className="mt-3 space-y-1 border-t pt-3">
                  <p className="font-medium">Recent orders</p>
                  {customerOrders.map((order) => (
                    <p key={order.id} className="text-muted-foreground">
                      {order.orderNumber ?? order.id.slice(0, 8)} · {order.status} · {order.total}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-muted-foreground">No previous orders found.</p>
              )}
              <Input
                className="mt-2"
                placeholder="Points to redeem (optional)"
                value={loyaltyRedeemPoints}
                onChange={(e) => setLoyaltyRedeemPoints(e.target.value)}
              />
              <Input
                className="mt-2"
                placeholder="Store credit amount (optional)"
                value={storeCreditAmount}
                onChange={(e) => setStoreCreditAmount(e.target.value)}
              />
            </div>
          ) : null}
          <div className="rounded-md border p-3 text-sm">
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
                  Balance: {giftCard.balance} {giftCard.currency}
                </p>
                <Input
                  className="mt-2"
                  placeholder="Gift card amount to use"
                  value={giftCardAmount}
                  onChange={(e) => setGiftCardAmount(e.target.value)}
                />
              </>
            ) : null}
          </div>
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

          {!online ? (
            <p className="text-sm text-amber-700">
              You are offline. This sale will be queued until connectivity returns.
            </p>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <ModalFooter>
          <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="h-11" disabled={loading} onClick={confirm}>
            {loading ? 'Processing…' : 'Confirm order'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
