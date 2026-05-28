'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Divider,
  FormField,
  Input,
  Stack,
  Text,
} from '@shared-ui';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogFooterActions,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/pos-dialog';
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
import {
  DEFAULT_OFFLINE_SETTINGS,
  applyOfflineInventorySale,
  loadOfflineBootstrap,
  loadOfflineSettings,
  saveInventoryAdjustment,
  saveLocalCustomer,
  savePendingOfflineOrder,
  type OfflineModeSettings,
  type OfflineOrderPayload,
} from '@/lib/offline-db';
import { syncPendingOfflineWork } from '@/lib/offline-sync';
import { calculatePosTotals } from '@/lib/pos-pricing';
import { getSession } from '@/lib/session';
import { useCartStore } from '@/stores/cart-store';
import { PosRecommendationsPanel } from '@/components/pos-recommendations-panel';
import { useTenantSettings } from '@/hooks/use-tenant-settings';

type PosCheckoutModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  online: boolean;
};

const ORDER_TYPE_OPTIONS = [
  { value: 'pos', label: 'In-store' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'delivery', label: 'Delivery' },
] as const;

const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'external', label: 'External' },
] as const;

export function PosCheckoutModal({ open, onOpenChange, online }: PosCheckoutModalProps) {
  const { settings, formatCurrency, formatDate } = useTenantSettings();
  const router = useRouter();
  const cartId = useCartStore((s) => s.cartId);
  const lines = useCartStore((s) => s.lines);
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
  const [offlineSettings, setOfflineSettings] = useState<OfflineModeSettings>(DEFAULT_OFFLINE_SETTINGS);

  useEffect(() => {
    if (!open) return;
    const term = customerPhone.trim() || customerEmail.trim();
    if (term.length < 3) {
      setSelectedCustomer(null);
      return;
    }
    const timeout = window.setTimeout(async () => {
      if (!online) {
        const bootstrap = await loadOfflineBootstrap();
        const match =
          bootstrap?.customers.find((customer) => {
            const haystack = [customer.name, customer.phone, customer.email].filter(Boolean).join(' ').toLowerCase();
            return haystack.includes(term.toLowerCase());
          }) ?? null;
        setSelectedCustomer(
          match
            ? {
                id: match.id,
                name: match.name,
                phone: match.phone ?? null,
                email: match.email ?? null,
                pointsBalance: match.pointsBalance ?? 0,
                storeCreditBalance: match.storeCreditBalance ?? '0.00',
                lifetimeValue: '0.00',
              }
            : null,
        );
        return;
      }
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
  }, [customerEmail, customerPhone, online, open]);

  useEffect(() => {
    if (!open) return;
    void loadOfflineSettings().then(setOfflineSettings);
  }, [open]);

  useEffect(() => {
    if (!selectedCustomer || !online) {
      setCustomerOrders([]);
      setCustomerTags('');
      setCustomerNotes('');
      return;
    }
    void fetchLoyaltyCustomerOrders(selectedCustomer.id)
      .then((orders) => setCustomerOrders(orders.slice(0, 5)))
      .catch(() => setCustomerOrders([]));
  }, [online, selectedCustomer]);

  useEffect(() => {
    if (!open || giftCardCode.trim().length < 4) {
      setGiftCard(null);
      return;
    }
    if (!online) {
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
  }, [giftCardCode, online, open]);

  const buildOfflinePayload = async (): Promise<OfflineOrderPayload | null> => {
    if (!lines.length) {
      setError('Cart is empty');
      return null;
    }
    if (!offlineSettings.enabled) {
      setError('Offline mode is disabled for this location');
      return null;
    }
    const session = getSession();
    const bootstrap = await loadOfflineBootstrap();
    if (bootstrap) {
      const offlineAgeMinutes = (Date.now() - new Date(bootstrap.syncedAt).getTime()) / 60000;
      if (offlineAgeMinutes > offlineSettings.maxOfflineDurationMinutes) {
        setError('Offline mode lockout reached. Reconnect to refresh POS data.');
        return null;
      }
    }
    const staff = bootstrap?.staffPermissions.find((member) => member.staffId === session.cashierId);
    if (bootstrap?.staffPermissions.length && !staff) {
      setError('This staff member is not available for offline checkout.');
      return null;
    }
    if (staff && (!staff.permissions.includes('pos:checkout') || !staff.permissions.includes('pos:payment'))) {
      setError('This staff member does not have offline checkout permissions.');
      return null;
    }
    if (paymentMethod === 'card' && !offlineSettings.allowOfflineCardPayments) {
      setError('Offline card payments are disabled. Choose cash or wait for connection.');
      return null;
    }
    if (giftCardCode && !giftCard) {
      setError('Gift cards can only be used offline when the balance was cached first.');
      return null;
    }
    if (giftCard && giftCardAmount && Number(giftCardAmount) > Number(giftCard.balance)) {
      setError('Gift card amount exceeds cached balance.');
      return null;
    }
    if (storeCreditAmount && !selectedCustomer) {
      setError('Store credit requires a cached customer.');
      return null;
    }
    if (
      storeCreditAmount &&
      selectedCustomer &&
      Number(storeCreditAmount) > Number(selectedCustomer.storeCreditBalance)
    ) {
      setError('Store credit amount exceeds cached balance.');
      return null;
    }
    if (
      loyaltyRedeemPoints &&
      selectedCustomer &&
      Number(loyaltyRedeemPoints) > selectedCustomer.pointsBalance
    ) {
      setError('Loyalty redemption exceeds cached points.');
      return null;
    }

    const now = new Date().toISOString();
    const clientOrderId = crypto.randomUUID();
    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const discount = Math.min(
      subtotal,
      (discountPercent ? subtotal * (discountPercent / 100) : 0) + (discountFixed || 0),
    );
    const estimate = calculatePosTotals({
      subtotal,
      discountPercent,
      discountFixed,
      taxRate: Number(settings.defaultTaxRate) || 23,
      priceMode: 'inclusive',
    });
    const total = estimate.total;
    const localCustomerId =
      !selectedCustomer && (customerName || customerPhone || customerEmail) ? `local-${crypto.randomUUID()}` : undefined;

    if (localCustomerId) {
      await saveLocalCustomer({
        id: localCustomerId,
        name: customerName || 'Offline customer',
        phone: customerPhone || null,
        email: customerEmail || null,
      });
    }

    const flags = [
      paymentMethod === 'card' ? 'offline_card_payment_requires_capture' : null,
      paymentMethod === 'external' ? 'offline_external_payment_requires_review' : null,
      giftCardCode ? 'offline_gift_card_redemption' : null,
      storeCreditAmount ? 'offline_store_credit_redemption' : null,
      loyaltyRedeemPoints ? 'offline_loyalty_redemption' : null,
    ].filter(Boolean) as string[];

    return {
      clientOrderId,
      session,
      orderType,
      paymentMethod,
      lines,
      orderNotes: orderNotes || undefined,
      customer:
        customerName || customerPhone || customerEmail || selectedCustomer || localCustomerId
          ? {
              name: customerName || selectedCustomer?.name,
              phone: customerPhone || selectedCustomer?.phone || undefined,
              email: customerEmail || selectedCustomer?.email || undefined,
              customerId: selectedCustomer?.id,
              localCustomerId,
            }
          : undefined,
      loyaltyRedeemPoints: loyaltyRedeemPoints ? Number(loyaltyRedeemPoints) : undefined,
      giftCardCode: giftCardCode || undefined,
      giftCardAmount: giftCardAmount ? Number(giftCardAmount) : undefined,
      storeCreditAmount: storeCreditAmount ? Number(storeCreditAmount) : undefined,
      couponCode: couponCode || undefined,
      discountPercent: discountPercent || undefined,
      discountFixed: discountFixed || undefined,
      totals: {
        subtotal: subtotal.toFixed(2),
        discountTotal: discount.toFixed(2),
        tax: estimate.tax.toFixed(2),
        taxLines: estimate.taxBreakdown.map((line) => ({
          taxName: line.taxName,
          taxType: 'sales_tax',
          priceMode: line.priceMode,
          taxRate: line.taxRate.toFixed(4),
          taxableAmount: line.taxableAmount.toFixed(2),
          taxAmount: line.taxAmount.toFixed(2),
          jurisdiction: 'offline',
        })),
        total: total.toFixed(2),
      },
      flags,
      createdAt: now,
    };
  };

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

    if (!online || cartId.startsWith('local-')) {
      const offlinePayload = await buildOfflinePayload();
      if (!offlinePayload) {
        setLoading(false);
        return;
      }
      await savePendingOfflineOrder({
        id: offlinePayload.clientOrderId,
        createdAt: offlinePayload.createdAt,
        updatedAt: offlinePayload.createdAt,
        status: 'pending',
        attempts: 0,
        conflicts: [],
        payload: offlinePayload,
      });
      await Promise.all(
        offlinePayload.lines.map((line) =>
          saveInventoryAdjustment({
            id: `${offlinePayload.clientOrderId}-${line.productId}-${line.variantId ?? 'base'}`,
            productId: line.productId,
            quantityDelta: -line.quantity,
            reason: 'offline_sale',
            createdAt: offlinePayload.createdAt,
            status: 'pending',
          }),
        ),
      );
      await applyOfflineInventorySale(offlinePayload.lines);
      clearCart();
      onOpenChange(false);
      setLoading(false);
      if (online) {
        void syncPendingOfflineWork(offlineSettings);
      }
      router.push(`/receipt?orderId=${offlinePayload.clientOrderId}&offline=1`);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>Review order type, payment, customer details, and discounts before confirming.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Stack gap="md">
            <div role="status" aria-live="polite" className="sr-only">
              {error ?? ''}
            </div>
            <Stack gap="sm">
              <Text className="text-sm font-medium">Order type</Text>
              <div className="grid grid-cols-3 gap-2 rounded-md bg-muted p-1">
              {ORDER_TYPE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={orderType === option.value ? 'default' : 'ghost'}
                  className="h-11"
                  aria-pressed={orderType === option.value}
                  aria-label={`Order type: ${option.label}`}
                  onClick={() => setOrderType(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            </Stack>

            <Divider />

            <Stack gap="sm">
              <Text className="text-sm font-medium">Payment</Text>
              <div className="grid grid-cols-3 gap-2 rounded-md bg-muted p-1">
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={paymentMethod === option.value ? 'default' : 'ghost'}
                  className="h-11"
                  aria-pressed={paymentMethod === option.value}
                  aria-label={`Payment method: ${option.label}`}
                  onClick={() => setPaymentMethod(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            </Stack>

            <Divider />

            <Stack gap="md">
              <FormField label="Customer name" htmlFor="checkout-customer-name">
                <Input
                  id="checkout-customer-name"
                  placeholder="Optional"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  autoComplete="name"
                />
              </FormField>
              <FormField label="Customer phone" htmlFor="checkout-customer-phone">
                <Input
                  id="checkout-customer-phone"
                  type="tel"
                  placeholder="Optional"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  autoComplete="tel"
                />
              </FormField>
              <FormField label="Customer email" htmlFor="checkout-customer-email">
                <Input
                  id="checkout-customer-email"
                  type="email"
                  placeholder="Optional"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  autoComplete="email"
                />
              </FormField>
            </Stack>
          {selectedCustomer ? (
            <Stack gap="md" className="rounded-md border border-border p-4">
              <Text className="font-medium">{selectedCustomer.name}</Text>
              <Text variant="muted">{selectedCustomer.pointsBalance} points available</Text>
              <Text variant="muted">Store credit: {selectedCustomer.storeCreditBalance}</Text>
              <Text variant="muted">Lifetime value: {selectedCustomer.lifetimeValue}</Text>
              <Text variant="muted">
                Last order: {selectedCustomer.lastOrderAt ? formatDate(selectedCustomer.lastOrderAt) : 'No orders'}
              </Text>
              {selectedCustomer.tags?.length ? (
                <Text variant="muted">Tags: {selectedCustomer.tags.join(', ')}</Text>
              ) : null}
              {selectedCustomer.staffNotes ? (
                <Text variant="muted">Notes: {selectedCustomer.staffNotes}</Text>
              ) : null}
              <FormField label="Customer tags" htmlFor="checkout-customer-tags" helper="Comma-separated">
                <Input
                  id="checkout-customer-tags"
                  value={customerTags}
                  onChange={(e) => setCustomerTags(e.target.value)}
                />
              </FormField>
              <FormField label="Customer notes" htmlFor="checkout-customer-notes">
                <Input
                  id="checkout-customer-notes"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                />
              </FormField>
              <Button type="button" variant="outline" onClick={() => void saveCustomerCrm()}>
                Save customer CRM
              </Button>
              {customerOrders.length ? (
                <Stack gap="xs" className="border-t border-border pt-3">
                  <Text className="font-medium">Recent orders</Text>
                  {customerOrders.map((order) => (
                    <Text key={order.id} variant="muted">
                      {order.orderNumber ?? order.id.slice(0, 8)} · {order.status} · {formatCurrency(order.total)}
                    </Text>
                  ))}
                </Stack>
              ) : (
                <Text variant="muted">No previous orders found.</Text>
              )}
              <FormField label="Points to redeem" htmlFor="checkout-loyalty-points">
                <Input
                  id="checkout-loyalty-points"
                  placeholder="Optional"
                  value={loyaltyRedeemPoints}
                  onChange={(e) => setLoyaltyRedeemPoints(e.target.value)}
                />
              </FormField>
              <FormField label="Store credit amount" htmlFor="checkout-store-credit">
                <Input
                  id="checkout-store-credit"
                  placeholder="Optional"
                  value={storeCreditAmount}
                  onChange={(e) => setStoreCreditAmount(e.target.value)}
                />
              </FormField>
            </Stack>
          ) : null}

          <Divider />

          <Stack gap="md" className="rounded-md border border-border p-4">
            <Text className="font-medium">Gift card</Text>
            <FormField label="Gift card code" htmlFor="checkout-gift-card-code">
              <Input
                id="checkout-gift-card-code"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value)}
              />
            </FormField>
            {giftCard ? (
              <>
                <Text variant="muted">
                  Balance: {formatCurrency(giftCard.balance)} {giftCard.currency}
                </Text>
                <FormField label="Amount to apply" htmlFor="checkout-gift-card-amount">
                  <Input
                    id="checkout-gift-card-amount"
                    value={giftCardAmount}
                    onChange={(e) => setGiftCardAmount(e.target.value)}
                  />
                </FormField>
              </>
            ) : null}
          </Stack>

          <FormField label="Order notes" htmlFor="checkout-order-notes">
            <Input
              id="checkout-order-notes"
              placeholder="Optional"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </FormField>
          <FormField label="Coupon code" htmlFor="checkout-coupon-code">
            <Input
              id="checkout-coupon-code"
              placeholder="Optional"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
          </FormField>

          <PosRecommendationsPanel customerId={selectedCustomer?.id} />

          {!online ? (
            <Text variant="muted" className="rounded-md bg-muted p-3">
              You are offline. This sale will be queued until connectivity returns.
            </Text>
          ) : null}
          {error ? (
            <Text variant="destructive" role="alert">
              {error}
            </Text>
          ) : null}
          </Stack>
        </DialogBody>
        <DialogFooter>
          <DialogFooterActions>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={loading} isLoading={loading} loadingLabel="Processing…" onClick={confirm}>
              Confirm order
            </Button>
          </DialogFooterActions>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
