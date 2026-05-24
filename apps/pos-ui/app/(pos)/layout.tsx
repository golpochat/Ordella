import Link from 'next/link';
import { Logo } from '@shared-ui';
import { PosSessionModal } from '@/components/pos-session-modal';

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Link href="/home" className="inline-flex items-center gap-3">
            <Logo variant="mark" size="md" color="auto" />
            <span className="text-lg font-semibold">POS</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/home" className="rounded-md px-3 py-2 hover:bg-accent">
              Home
            </Link>
            <Link href="/cart" className="rounded-md px-3 py-2 hover:bg-accent">
              Cart
            </Link>
            <Link href="/checkout" className="rounded-md px-3 py-2 hover:bg-accent">
              Checkout
            </Link>
          </nav>
        </div>
        <PosSessionModal />
      </header>
      {children}
    </div>
  );
}
