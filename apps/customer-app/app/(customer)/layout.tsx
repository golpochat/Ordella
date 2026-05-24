import { CustomerBottomNav } from '@/components/customer-bottom-nav';
import { CustomerHeader } from '@/components/customer-header';
import { CustomerSessionGate } from '@/components/customer-session-gate';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerSessionGate>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col">
        <CustomerHeader />
        <main className="flex-1">{children}</main>
        <CustomerBottomNav />
      </div>
    </CustomerSessionGate>
  );
}
