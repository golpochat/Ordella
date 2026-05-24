'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@shared-ui';
import { ProductDetail } from '@/components/product-detail';
import { fetchPublicMenu, type OnlineProduct } from '@/lib/api';

type ProductPageProps = {
  params: { id: string };
};

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<OnlineProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicMenu()
      .then((menu) => {
        const match = menu.products.find((p) => p.id === params.id);
        if (!match) {
          setError('Product not found');
          return;
        }
        setProduct(match);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load product'));
  }, [params.id]);

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/menu">Back to catalog</Link>
        </Button>
      </div>
    );
  }

  if (!product) {
    return <p className="p-6 text-muted-foreground">Loading product…</p>;
  }

  return <ProductDetail product={product} />;
}
