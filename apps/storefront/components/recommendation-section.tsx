'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Card, CardContent } from '@shared-ui';
import {
  fetchCartRecommendations,
  fetchCustomerRecommendations,
  fetchItemRecommendations,
  isProductOrderable,
  trackRecommendationEvent,
  type RecommendationItem,
} from '@/lib/api';
import { useBasketStore } from '@/stores/basket-store';

type RecommendationSectionProps = {
  title: string;
  source: string;
  itemId?: string;
  itemIds?: string[];
  customerId?: string;
  mode?: 'item' | 'cart' | 'customer';
  limit?: number;
};

function reasonLabel(reason: RecommendationItem['reason']) {
  switch (reason) {
    case 'frequently_bought_together':
      return 'Frequently bought together';
    case 'frequently_viewed_together':
      return 'You may also like';
    case 'customer_preference':
      return 'Based on your preferences';
    case 'same_category':
      return 'Similar item';
    case 'popular_item':
      return 'Popular choice';
  }
}

export function RecommendationSection({
  title,
  source,
  itemId,
  itemIds,
  customerId,
  mode = itemId ? 'item' : 'cart',
  limit = 4,
}: RecommendationSectionProps) {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const addItem = useBasketStore((state) => state.addItem);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const load =
      mode === 'customer' && customerId
        ? fetchCustomerRecommendations(customerId, { itemIds, limit })
        : mode === 'item' && itemId
          ? fetchItemRecommendations(itemId, { customerId, limit })
          : fetchCartRecommendations({ itemIds, customerId, limit });

    void load
      .then((response) => {
        if (!active) return;
        setItems(response.recommendations);
        for (const recommendation of response.recommendations) {
          void trackRecommendationEvent({
            itemId: recommendation.item.id,
            customerId,
            eventType: 'impression',
            source,
          }).catch(() => undefined);
        }
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [customerId, itemId, itemIds, limit, mode, source]);

  if (!loading && items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">Helpful add-ons selected from similar baskets and catalog trends.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((recommendation) => {
          const product = recommendation.item;
          const hasOptions = product.variants.length > 0 || product.modifiers.length > 0;
          const orderable = isProductOrderable(product);
          return (
            <Card key={product.id}>
              <CardContent className="space-y-3 p-4">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{reasonLabel(recommendation.reason)}</p>
                  <p className="text-sm">${product.price}</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="h-10 flex-1">
                    <Link
                      href={`/product/${product.id}`}
                      onClick={() =>
                        void trackRecommendationEvent({
                          itemId: product.id,
                          customerId,
                          eventType: 'click',
                          source,
                        }).catch(() => undefined)
                      }
                    >
                      View
                    </Link>
                  </Button>
                  {hasOptions ? (
                    <Button asChild className="h-10 flex-1">
                      <Link href={`/product/${product.id}`}>Customize</Link>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="h-10 flex-1"
                      disabled={!orderable}
                      onClick={() => {
                        addItem(product);
                        void trackRecommendationEvent({
                          itemId: product.id,
                          customerId,
                          eventType: 'add_to_cart',
                          source,
                        }).catch(() => undefined);
                      }}
                    >
                      Add
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
