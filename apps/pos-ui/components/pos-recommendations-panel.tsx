'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent } from '@shared-ui';
import {
  fetchPosRecommendations,
  trackPosRecommendationEvent,
  type PosRecommendationItem,
} from '@/lib/api';
import { useCartStore } from '@/stores/cart-store';

type PosRecommendationsPanelProps = {
  customerId?: string;
};

function reasonLabel(reason: PosRecommendationItem['reason']) {
  if (reason === 'frequently_bought_together') return 'Frequently bought together';
  if (reason === 'customer_preference') return 'Customer preference';
  if (reason === 'same_category') return 'Similar item';
  if (reason === 'frequently_viewed_together') return 'Often viewed together';
  return 'Popular add-on';
}

export function PosRecommendationsPanel({ customerId }: PosRecommendationsPanelProps) {
  const lines = useCartStore((state) => state.lines);
  const addCatalogItem = useCartStore((state) => state.addCatalogItem);
  const [items, setItems] = useState<PosRecommendationItem[]>([]);
  const itemIds = useMemo(() => lines.map((line) => line.productId), [lines]);

  useEffect(() => {
    if (!itemIds.length) {
      setItems([]);
      return;
    }
    let active = true;
    void fetchPosRecommendations({ itemIds, customerId, limit: 4 })
      .then((response) => {
        if (!active) return;
        setItems(response.recommendations);
        for (const recommendation of response.recommendations) {
          void trackPosRecommendationEvent({
            itemId: recommendation.item.id,
            customerId,
            eventType: 'impression',
            source: 'pos_checkout',
          }).catch(() => undefined);
        }
      })
      .catch(() => {
        if (active) setItems([]);
      });
    return () => {
      active = false;
    };
  }, [customerId, itemIds]);

  if (!items.length) return null;

  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        <div>
          <p className="text-sm font-medium">Recommended add-ons</p>
          <p className="text-xs text-muted-foreground">Frequently paired items for this cart.</p>
        </div>
        <div className="space-y-2">
          {items.map((recommendation) => {
            const item = recommendation.item;
            const hasOptions = item.variants.length > 0 || item.modifiers.length > 0;
            return (
              <div key={item.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {reasonLabel(recommendation.reason)} · ${item.price}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={hasOptions || item.isOutOfStock}
                  onClick={() => {
                    void addCatalogItem(item);
                    void trackPosRecommendationEvent({
                      itemId: item.id,
                      customerId,
                      eventType: 'add_to_cart',
                      source: 'pos_checkout',
                    }).catch(() => undefined);
                  }}
                >
                  {hasOptions ? 'Options' : 'Add'}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
