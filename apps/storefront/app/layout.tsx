import type { Metadata } from 'next';
import '@ordella/shared-ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Order Online',
  description: 'Order food online',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
