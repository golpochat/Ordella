import type { Metadata } from 'next';
import '@ordella/shared-ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ordella KDS',
  description: 'Kitchen display for Ordella restaurants',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
