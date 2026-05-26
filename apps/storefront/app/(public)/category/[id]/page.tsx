'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@shared-ui';
import { CatalogView } from '@/components/catalog-view';
import { fetchPublicMenu, type OnlineMenu } from '@/lib/api';

type CategoryPageProps = {
  params: { id: string };
};

function CategoryPageInner({ id }: { id: string }) {
  const [menu, setMenu] = useState<OnlineMenu | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicMenu()
      .then(setMenu)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load category'));
  }, []);

  if (error) {
    return (
      <div className="p-[var(--theme-spacing)]">
        <p className="text-sm text-destructive">{error}</p>
        <Button asChild className="mt-4 rounded-[var(--storefront-radius)]">
          <Link href="/catalog">Back to catalog</Link>
        </Button>
      </div>
    );
  }

  if (!menu) {
    return <p className="p-[var(--theme-spacing)] text-muted-foreground">Loading category...</p>;
  }

  if (!menu.categories.some((category) => category.id === id)) {
    return (
      <div className="mx-auto max-w-xl px-[var(--theme-spacing)] py-[var(--storefront-section-padding)] text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <p className="mt-2 text-muted-foreground">Browse the full catalog instead.</p>
        <Button asChild className="mt-6 rounded-[var(--storefront-radius)]">
          <Link href="/catalog">View catalog</Link>
        </Button>
      </div>
    );
  }

  return <CatalogView menu={menu} initialCategoryId={id} />;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <Suspense fallback={<p className="p-[var(--theme-spacing)] text-muted-foreground">Loading category...</p>}>
      <CategoryPageInner id={params.id} />
    </Suspense>
  );
}

