'use client';

import { PageContainer } from '@shared-ui';
import { RecommendationSection } from '@/components/recommendation-section';
import { StorefrontCartPanel } from '@/components/storefront-cart-panel';
import { useBasketStore } from '@/stores/basket-store';

/** Standalone cart route — uses the same ODS cart panel as the catalog page. */
export function CartView() {
  const lines = useBasketStore((s) => s.lines);
  const cartProductIds = lines.map((line) => line.productId);

  return (
    <PageContainer
      as="div"
      maxWidth="lg"
      className="mx-auto w-full max-w-[var(--storefront-container)] bg-background"
    >
      <div className="mx-auto max-w-lg">
        <StorefrontCartPanel />
      </div>
      {lines.length > 0 ? (
        <div className="mt-8">
          <RecommendationSection
            title="Complete your order"
            source="cart_complete_your_order"
            itemIds={cartProductIds}
            mode="cart"
          />
        </div>
      ) : null}
    </PageContainer>
  );
}
