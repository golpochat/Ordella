'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button, Card, CardContent, useTheme } from '@shared-ui';
import type { HomepageSection } from '@shared-utils';
import type { OnlineMenu, OnlineProduct } from '@/lib/api';
import { isProductOrderable } from '@/lib/api';
import { useBasketStore } from '@/stores/basket-store';

type StorefrontHomeProps = {
  menu: OnlineMenu;
};

export function StorefrontHome({ menu }: StorefrontHomeProps) {
  const addItem = useBasketStore((s) => s.addItem);
  const theme = useTheme();

  const featuredCategories = [...menu.categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 4);

  const featuredItems = menu.products
    .filter((p) => isProductOrderable(p))
    .slice(0, 6);
  const sections = (theme.homepageSections?.length ? theme.homepageSections : undefined) ?? [
    { type: 'hero', enabled: true, title: 'Shop online', subtitle: 'Browse our catalog, customize your items, and choose pickup or delivery.', ctaLabel: 'Shop now', href: '/catalog' },
    { type: 'categories', enabled: true, title: 'Featured categories', limit: 4 },
    { type: 'featuredItems', enabled: true, title: 'Featured items', limit: 6 },
  ];

  return (
    <div>
      {sections.filter((section) => section.enabled !== false).map((section, index) => {
        if (section.type === 'hero') {
          return <HeroSection key={`${section.type}-${index}`} section={section} bannerUrl={theme.assets?.banner} brandName={theme.name} />;
        }
        if (section.type === 'categories' && featuredCategories.length > 0) {
          return (
            <section key={`${section.type}-${index}`} className="mx-auto max-w-6xl px-4 py-10">
              <h2 className="mb-4 text-2xl font-semibold">{section.title ?? 'Featured categories'}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {featuredCategories.slice(0, section.limit ?? 4).map((category) => (
                  <Button
                    key={category.id}
                    asChild
                    variant="outline"
                    className="h-auto min-h-20 justify-start rounded-[var(--theme-card-radius)] p-4 text-left text-base"
                  >
                    <Link href={`/catalog?category=${category.id}`}>{category.name}</Link>
                  </Button>
                ))}
              </div>
            </section>
          );
        }
        if (section.type === 'featuredItems' && featuredItems.length > 0) {
          return (
            <section key={`${section.type}-${index}`} className="mx-auto max-w-6xl px-4 pb-12">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{section.title ?? 'Featured items'}</h2>
                <Link href="/catalog" className="text-sm font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featuredItems.slice(0, section.limit ?? 6).map((product) => (
                  <FeaturedItemCard
                    key={product.id}
                    product={product}
                    onAdd={() => addItem(product)}
                  />
                ))}
              </div>
            </section>
          );
        }
        if (section.type === 'banner') {
          return <BannerSection key={`${section.type}-${index}`} section={section} />;
        }
        return null;
      })}
    </div>
  );
}

function HeroSection({
  section,
  bannerUrl,
  brandName,
}: {
  section: HomepageSection;
  bannerUrl?: string | null;
  brandName?: string;
}) {
  return (
    <section className="border-b bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Retail ordering</p>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight sm:text-4xl">
            {section.title ?? `Shop ${brandName ?? 'online'}`}
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            {section.subtitle ?? 'Browse the catalog, customize your items, and choose pickup or delivery.'}
          </p>
          <Button asChild className="mt-6 h-12 px-8 text-base">
            <Link href={section.href ?? '/catalog'}>
              {section.ctaLabel ?? 'Shop now'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
        {section.imageUrl || bannerUrl ? (
          <img
            src={section.imageUrl ?? bannerUrl ?? ''}
            alt=""
            className="hidden max-h-80 w-full rounded-[var(--theme-card-radius)] object-cover shadow-sm lg:block"
          />
        ) : null}
      </div>
    </section>
  );
}

function BannerSection({ section }: { section: HomepageSection }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <Card className="overflow-hidden rounded-[var(--theme-card-radius)]">
        {section.imageUrl ? <img src={section.imageUrl} alt="" className="max-h-64 w-full object-cover" /> : null}
        <CardContent className="space-y-2 p-6">
          <h2 className="text-2xl font-semibold">{section.title ?? 'Store banner'}</h2>
          {section.subtitle ? <p className="text-muted-foreground">{section.subtitle}</p> : null}
        </CardContent>
      </Card>
    </section>
  );
}

function FeaturedItemCard({
  product,
  onAdd,
}: {
  product: OnlineProduct;
  onAdd: () => void;
}) {
  const hasOptions = product.variants.length > 0 || product.modifiers.length > 0;

  return (
    <Card className="rounded-[var(--theme-card-radius)]">
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="font-semibold">{product.name}</p>
          <p className="text-sm text-muted-foreground">${product.price}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="h-11 flex-1">
            <Link href={`/product/${product.id}`}>View</Link>
          </Button>
          {hasOptions ? (
            <Button asChild className="h-11 flex-1">
              <Link href={`/product/${product.id}`}>Customize</Link>
            </Button>
          ) : (
            <Button type="button" className="h-11 flex-1" onClick={onAdd}>
              Add
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
