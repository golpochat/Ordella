'use client';

import { useState } from 'react';
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
import { checkoutCart, completeSale } from '@/lib/api';
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
  const [orderType, setOrderType] = useState<'pos' | 'pickup' | 'delivery'>('pos');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'external'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        customerName || customerPhone
          ? { name: customerName || undefined, phone: customerPhone || undefined }
          : undefined,
    };

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
        const checkout = await checkoutCart(cartId);
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
            placeholder="Order notes (optional)"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
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
