import { notFound } from 'next/navigation';
import { BundleDetail } from '@/components/bundle-detail';
import { fetchPublicMenu } from '@/lib/api';

export default async function BundlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const menu = await fetchPublicMenu();
  const bundle = menu.products.find((product) => product.id === id && product.itemType === 'bundle');
  if (!bundle) notFound();
  return <BundleDetail bundle={bundle} />;
}
