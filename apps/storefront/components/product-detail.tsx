'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { isProductOrderable, trackRecommendationEvent, type OnlineProduct } from '@/lib/api';
import { RecommendationSection } from '@/components/recommendation-section';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { useBasketStore } from '@/stores/basket-store';

export function ProductDetail({ product }: { product: OnlineProduct }) {
  const { formatCurrency } = useTenantSettings();
  const router = useRouter();
  const addItem = useBasketStore((s) => s.addItem);
  const error = useBasketStore((s) => s.error);
  const orderable = isProductOrderable(product);

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants[0]?.id,
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [purchaseType, setPurchaseType] = useState<'one_time' | 'subscription'>('one_time');
  const [subscriptionSchedule, setSubscriptionSchedule] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');

  const displayPrice = useMemo(() => {
    const variant = product.variants.find((v) => v.id === selectedVariantId);
    if (!variant || variant.priceDelta === '0' || variant.priceDelta === '0.00') {
      return product.price;
    }
    const base = Number.parseFloat(product.price);
    const delta = Number.parseFloat(variant.priceDelta);
    if (Number.isNaN(base) || Number.isNaN(delta)) return product.price;
    return (base + delta).toFixed(2);
  }, [product, selectedVariantId]);

  const requiredModifiers = useMemo(
    () => product.modifiers.filter((m) => m.required),
    [product.modifiers],
  );

  const toggleOption = (optionId: string, modifierId: string, multi: boolean) => {
    setSelectedOptions((prev) => {
      if (multi) {
        return prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId];
      }
      const withoutGroup = prev.filter(
        (id) => !product.modifiers.find((m) => m.id === modifierId)?.options.some((o) => o.id === id),
      );
      return [...withoutGroup, optionId];
    });
  };

  const canAdd =
    orderable &&
    requiredModifiers.every((modifier) =>
      modifier.options.some((option) => selectedOptions.includes(option.id)),
    ) &&
    (product.variants.length === 0 || !!selectedVariantId);

  useEffect(() => {
    void trackRecommendationEvent({ itemId: product.id, eventType: 'view', source: 'product_page' }).catch(() => undefined);
  }, [product.id]);

  const onAdd = () => {
    addItem(product, {
      variantId: selectedVariantId,
      modifierOptionIds: selectedOptions.length ? selectedOptions : undefined,
      purchaseType,
      subscriptionSchedule: purchaseType === 'subscription' ? subscriptionSchedule : undefined,
    });
    router.push('/cart');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {product.imageUrl ? (
            <p className="text-sm text-muted-foreground">Image: {product.imageUrl}</p>
          ) : null}
          {product.description ? <p className="text-muted-foreground">{product.description}</p> : null}
          {product.sku ? <p className="text-sm text-muted-foreground">SKU {product.sku}</p> : null}
          <p className="text-xl font-semibold">{formatCurrency(displayPrice)}</p>
          <p className="text-xs text-muted-foreground">Tax is calculated at checkout based on fulfillment location.</p>
          {!orderable ? <Badge variant="secondary">Out of stock</Badge> : null}
          {product.inventoryTrackingEnabled &&
          product.availableQuantity !== null &&
          product.availableQuantity !== undefined ? (
            <p className="text-sm text-muted-foreground">
              {product.availableQuantity > 0
                ? `${product.availableQuantity} in stock`
                : 'Out of stock'}
            </p>
          ) : null}

          {product.variants.length > 0 ? (
            <div className="space-y-2">
              <p className="font-medium">Variant</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <Button
                    key={variant.id}
                    type="button"
                    variant={selectedVariantId === variant.id ? 'default' : 'outline'}
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    {variant.name}
                    {variant.priceDelta !== '0' && variant.priceDelta !== '0.00'
                      ? ` (+${formatCurrency(variant.priceDelta)})`
                      : ''}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          {product.modifiers.map((modifier) => (
            <div key={modifier.id} className="space-y-2 rounded-md border p-3">
              <p className="font-medium">
                {modifier.name}
                {modifier.required ? <span className="text-destructive"> *</span> : null}
              </p>
              <div className="flex flex-wrap gap-2">
                {modifier.options.map((option) => {
                  const active = selectedOptions.includes(option.id);
                  return (
                    <Button
                      key={option.id}
                      type="button"
                      variant={active ? 'default' : 'outline'}
                      className="h-11"
                      onClick={() => toggleOption(option.id, modifier.id, modifier.type !== 'single')}
                    >
                      {option.name}
                      {option.priceDelta !== '0' ? ` (+${formatCurrency(option.priceDelta)})` : ''}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="space-y-2 rounded-md border p-3">
            <p className="font-medium">Subscribe & Save</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={purchaseType === 'one_time' ? 'default' : 'outline'}
                onClick={() => setPurchaseType('one_time')}
              >
                One-time purchase
              </Button>
              <Button
                type="button"
                variant={purchaseType === 'subscription' ? 'default' : 'outline'}
                onClick={() => setPurchaseType('subscription')}
              >
                Subscribe
              </Button>
            </div>
            {purchaseType === 'subscription' ? (
              <div className="grid gap-2 sm:grid-cols-3">
                <Button type="button" variant={subscriptionSchedule === 'weekly' ? 'default' : 'outline'} onClick={() => setSubscriptionSchedule('weekly')}>
                  Weekly
                </Button>
                <Button type="button" variant={subscriptionSchedule === 'biweekly' ? 'default' : 'outline'} onClick={() => setSubscriptionSchedule('biweekly')}>
                  Every 2 weeks
                </Button>
                <Button type="button" variant={subscriptionSchedule === 'monthly' ? 'default' : 'outline'} onClick={() => setSubscriptionSchedule('monthly')}>
                  Monthly
                </Button>
              </div>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="button" className="h-12 w-full text-base" disabled={!canAdd} onClick={onAdd}>
            {purchaseType === 'subscription' ? 'Add subscription to cart' : 'Add to cart'}
          </Button>
        </CardContent>
      </Card>
      <RecommendationSection
        title="Frequently bought together"
        source="product_page_frequently_bought_together"
        itemId={product.id}
        mode="item"
      />
      <RecommendationSection
        title="You may also like"
        source="product_page_you_may_also_like"
        itemIds={[product.id]}
        mode="cart"
      />
    </div>
  );
}
