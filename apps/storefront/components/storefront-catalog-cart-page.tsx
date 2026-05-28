'use client';

import type { OnlineMenu } from '@/lib/api';
import { Grid, GridItem, PageContainer, ScrollContainer, Stack } from '@shared-ui';
import { StorefrontCartPanel } from '@/components/storefront-cart-panel';
import { StorefrontCatalogPanel } from '@/components/storefront-catalog-panel';

export function StorefrontCatalogCartPage({
  menu,
  initialCategoryId,
}: {
  menu: OnlineMenu;
  initialCategoryId?: string;
}) {
  return (
    <PageContainer
      as="div"
      maxWidth="lg"
      className="mx-auto w-full max-w-[var(--storefront-container)] bg-background"
    >
      <Stack gap="lg" className="min-w-0">
        <Grid cols={12} gap="lg" className="items-start">
          <GridItem colSpan={12} className="min-[1025px]:col-span-8">
            <StorefrontCatalogPanel menu={menu} initialCategoryId={initialCategoryId} />
          </GridItem>
          <GridItem colSpan={12} className="min-[1025px]:col-span-4 min-[1025px]:sticky min-[1025px]:top-20">
            <ScrollContainer axis="y" className="min-w-0">
              <StorefrontCartPanel />
            </ScrollContainer>
          </GridItem>
        </Grid>
      </Stack>
    </PageContainer>
  );
}
