'use client';

import type { OnlineMenu } from '@/lib/api';
import { StorefrontCatalogCartPage } from '@/components/storefront-catalog-cart-page';

/** Catalog + cart shopping experience (ODS layout). */
export function CatalogView({
  menu,
  initialCategoryId,
}: {
  menu: OnlineMenu;
  initialCategoryId?: string;
}) {
  return <StorefrontCatalogCartPage menu={menu} initialCategoryId={initialCategoryId} />;
}
