import type { Metadata } from 'next';
import '@ordella/shared-ui/styles.css';
import { ThemeRoot } from '@/components/theme-root';
import { StorefrontFooter } from '@/components/storefront-footer';
import { StorefrontHeader } from '@/components/storefront-header';
import { buildStorefrontMetadata } from '@/lib/metadata';
import './globals.css';

export const metadata: Metadata = buildStorefrontMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRoot>
          <div className="flex min-h-screen flex-col">
            <StorefrontHeader />
            <main className="flex-1">{children}</main>
            <StorefrontFooter />
          </div>
        </ThemeRoot>
      </body>
    </html>
  );
}
