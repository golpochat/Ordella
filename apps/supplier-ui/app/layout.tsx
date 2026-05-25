import type { Metadata } from 'next';
import '@ordella/shared-ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ordella Supplier Portal',
  description: 'Supplier purchase order, catalog, and messaging portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
