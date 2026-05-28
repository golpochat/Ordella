import type { Metadata } from 'next';
import Script from 'next/script';
import '@ordella/shared-ui/styles.css';
import { ODS_LOCALE_BOOTSTRAP_SCRIPT, ODS_THEME_BOOTSTRAP_SCRIPT } from '@shared-ui';
import { ThemeRoot } from '@/components/theme-root';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ordella Admin',
  description: 'Multi-channel retail operations admin dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="ods-locale-bootstrap" strategy="beforeInteractive">
          {ODS_LOCALE_BOOTSTRAP_SCRIPT}
        </Script>
        <Script id="ods-theme-bootstrap" strategy="beforeInteractive">
          {ODS_THEME_BOOTSTRAP_SCRIPT}
        </Script>
      </head>
      <body>
        <ThemeRoot>{children}</ThemeRoot>
      </body>
    </html>
  );
}
