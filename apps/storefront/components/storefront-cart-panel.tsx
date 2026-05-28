'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  EmptyState,
  EmptyStateIcon,
  Flex,
  ScrollContainer,
  FormField,
  Heading,
  Input,
  Stack,
  Text,
  TextMuted,
  TextStrong,
  odsCardInteractive,
} from '@shared-ui';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { basketSubtotal, calculateStorefrontTotals } from '@/lib/storefront-pricing';
import { useBasketStore } from '@/stores/basket-store';

const PROMO_STORAGE_KEY = 'ordella.storefront.promoCode';

export function StorefrontCartPanel() {
  const { settings, formatCurrency } = useTenantSettings();
  const lines = useBasketStore((s) => s.lines);
  const hydrate = useBasketStore((s) => s.hydrate);
  const updateQuantity = useBasketStore((s) => s.updateQuantity);
  const removeLine = useBasketStore((s) => s.removeLine);
  const setLineNotes = useBasketStore((s) => s.setLineNotes);
  const clearBasket = useBasketStore((s) => s.clearBasket);
  const error = useBasketStore((s) => s.error);

  const [promoCode, setPromoCode] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');

  useEffect(() => {
    hydrate();
    if (typeof window === 'undefined') return;
    setPromoCode(window.sessionStorage.getItem(PROMO_STORAGE_KEY) ?? '');
  }, [hydrate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const trimmed = promoCode.trim();
    if (trimmed) window.sessionStorage.setItem(PROMO_STORAGE_KEY, trimmed);
    else window.sessionStorage.removeItem(PROMO_STORAGE_KEY);
  }, [promoCode]);

  const subtotal = basketSubtotal(lines);
  const totals = calculateStorefrontTotals(subtotal, {
    taxRate: Number(settings.defaultTaxRate) || 23,
    priceMode: 'inclusive',
  });
  const itemCount = lines.reduce((n, line) => n + line.quantity, 0);

  const liveSummary = useMemo(
    () => `${itemCount} item${itemCount === 1 ? '' : 's'} in cart. Estimated total ${formatCurrency(totals.total)}.`,
    [formatCurrency, itemCount, totals.total],
  );

  return (
    <Card className={odsCardInteractive} data-ods-elevation="sm">
      <CardHeader className="pb-2">
        <Heading level={4}>Your cart</Heading>
        <TextMuted as="span">{itemCount} items</TextMuted>
      </CardHeader>
      <CardContent>
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveSummary}
        </div>

        {lines.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Add items from the catalog to begin checkout."
            size="compact"
            icon={
              <EmptyStateIcon>
                <ShoppingCart className="h-6 w-6" aria-hidden />
              </EmptyStateIcon>
            }
          />
        ) : (
          <Stack gap="md" className="animate-in fade-in duration-fast motion-reduce:animate-none">
            {error ? <Text variant="destructive">{error}</Text> : null}

            <ScrollContainer axis="y" className="max-h-[min(50vh,28rem)] pr-1">
              <Stack gap="sm">
              {lines.map((line) => (
                <Card key={line.lineId} className="border-border shadow-none">
                  <CardContent className="p-4">
                    <Stack gap="sm">
                      <Flex align="start" justify="between" gap="sm">
                        <Stack gap="xs">
                          <TextStrong as="p">{line.name}</TextStrong>
                          {line.variantName ? <TextMuted>{line.variantName}</TextMuted> : null}
                          {line.modifierLabels.length ? (
                            <TextMuted>{line.modifierLabels.join(', ')}</TextMuted>
                          ) : null}
                          <TextMuted>{line.sku?.trim() ? `SKU ${line.sku}` : 'SKU —'}</TextMuted>
                          <Text variant="muted">{formatCurrency(line.unitPrice)} each</Text>
                        </Stack>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={`Remove ${line.name} from cart`}
                          onClick={() => removeLine(line.lineId)}
                        >
                          Remove
                        </Button>
                      </Flex>

                      <Flex align="center" gap="sm">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Decrease quantity of ${line.name}`}
                          onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                        >
                          −
                        </Button>
                        <TextStrong as="span" className="min-w-8 text-center tabular-nums">
                          {line.quantity}
                        </TextStrong>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Increase quantity of ${line.name}`}
                          disabled={
                            line.availableQuantity !== null &&
                            line.availableQuantity !== undefined &&
                            line.quantity >= line.availableQuantity
                          }
                          onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                        >
                          +
                        </Button>
                      </Flex>

                      <FormField label="Item note" htmlFor={`note-${line.lineId}`}>
                        <Input
                          placeholder="Optional note for this item"
                          defaultValue={line.notes ?? ''}
                          onBlur={(e) => {
                            const value = e.target.value.trim();
                            if (value !== (line.notes ?? '')) {
                              setLineNotes(line.lineId, value);
                            }
                          }}
                        />
                      </FormField>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              </Stack>
            </ScrollContainer>

            <Stack gap="sm">
              <Heading level={4}>Discounts</Heading>
              <FormField label="Promo code" htmlFor="cart-promo-code" helper="Applied at checkout">
                <Input
                  id="cart-promo-code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  autoComplete="off"
                />
              </FormField>
              <FormField label="Gift card" htmlFor="cart-gift-card" helper="Validated during checkout">
                <Input
                  id="cart-gift-card"
                  value={giftCardCode}
                  onChange={(e) => setGiftCardCode(e.target.value)}
                  placeholder="Gift card code"
                  autoComplete="off"
                />
              </FormField>
            </Stack>

            <Divider />

            <Stack gap="xs">
              <Flex justify="between" align="center">
                <Text>Subtotal</Text>
                <TextStrong className="tabular-nums">{formatCurrency(totals.subtotal)}</TextStrong>
              </Flex>
              {totals.taxBreakdown.map((line) => (
                <Flex key={line.taxName} justify="between" align="center">
                  <Text variant="muted">
                    {line.taxName} ({line.taxRate.toFixed(2)}%, est.)
                  </Text>
                  <Text className="tabular-nums">{formatCurrency(line.taxAmount)}</Text>
                </Flex>
              ))}
              <Flex justify="between" align="center">
                <TextStrong>Total (est.)</TextStrong>
                <TextStrong className="tabular-nums text-lg">{formatCurrency(totals.total)}</TextStrong>
              </Flex>
            </Stack>

            <Stack gap="sm">
              <Button asChild className="w-full" aria-label="Proceed to checkout">
                <Link href="/checkout">Checkout</Link>
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="w-full"
                aria-label="Clear all items from cart"
                onClick={clearBasket}
              >
                Clear cart
              </Button>
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
