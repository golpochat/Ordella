import type { Metadata } from 'next';
import '@ordella/shared-ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ordella FDS',
  description: 'Fulfillment display for multi-channel retail businesses',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
