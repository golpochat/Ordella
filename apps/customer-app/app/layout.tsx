import type { Metadata } from 'next';
import '@ordella/shared-ui/styles.css';
import { ThemeRoot } from '@/components/theme-root';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ordella',
  description: 'Customer app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeRoot>{children}</ThemeRoot>
      </body>
    </html>
  );
}
