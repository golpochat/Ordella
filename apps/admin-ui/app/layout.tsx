import type { Metadata } from 'next';
import '@ordella/shared-ui/styles.css';
import { ThemeRoot } from '@/components/theme-root';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ordella Admin',
  description: 'Multi-channel retail operations admin dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRoot>{children}</ThemeRoot>
      </body>
    </html>
  );
}
