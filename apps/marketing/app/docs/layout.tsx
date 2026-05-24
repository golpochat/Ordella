import { DocsShell } from '@/components/docs/docs-shell';
import { getDocsNavigation } from '@/lib/docs';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Documentation',
  description:
    'Help center for Ordella — getting started, onboarding, admin, POS, storefront, delivery, branding, and billing.',
  path: '/docs',
});

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const navigation = getDocsNavigation();

  return <DocsShell navigation={navigation}>{children}</DocsShell>;
}
