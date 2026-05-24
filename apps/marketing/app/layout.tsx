import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@ordella/shared-ui/styles.css';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Analytics } from '@/components/analytics';
import { CookieBanner } from '@/components/cookie-banner';
import { createMetadata } from '@/lib/metadata';
import { siteConfig } from '@/lib/site';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const homeDescription =
  'POS, online ordering, inventory, fulfillment, delivery, and multi-location management for restaurants, cafés, takeaways, grocery, butchers, and retail businesses.';

export const metadata: Metadata = {
  ...createMetadata({
    title: siteConfig.name,
    description: homeDescription,
    path: '/',
  }),
  title: 'Ordella — Multi-channel retail platform',
  description: homeDescription,
  openGraph: {
    ...createMetadata({ title: siteConfig.name, description: homeDescription, path: '/' }).openGraph,
    title: 'Ordella — Multi-channel retail platform',
    description: homeDescription,
  },
  twitter: {
    ...createMetadata({ title: siteConfig.name, description: homeDescription, path: '/' }).twitter,
    title: 'Ordella — Multi-channel retail platform',
    description: homeDescription,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: siteConfig.themeColor },
    { media: '(prefers-color-scheme: dark)', color: siteConfig.themeColorDark },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="icon"
          href="/favicon-32x32.png"
          type="image/png"
          sizes="32x32"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/favicon-16x16.png"
          type="image/png"
          sizes="16x16"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/favicon-32x32-dark.png"
          type="image/png"
          sizes="32x32"
          media="(prefers-color-scheme: dark)"
        />
        <link
          rel="icon"
          href="/favicon-16x16-dark.png"
          type="image/png"
          sizes="16x16"
          media="(prefers-color-scheme: dark)"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color={siteConfig.themeColor} />
        <link rel="manifest" href={siteConfig.manifestPath} />
        <meta name="theme-color" content={siteConfig.themeColor} media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content={siteConfig.themeColorDark} media="(prefers-color-scheme: dark)" />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:shadow-elevated"
        >
          Skip to main content
        </a>
        <Analytics />
        <Header />
        <main id="main-content" className="flex-1 overflow-x-hidden">
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
