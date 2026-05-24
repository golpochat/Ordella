import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ordella Driver',
  description: 'Delivery driver app for retail and food businesses',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
