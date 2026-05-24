import { DriverBottomNav } from '@/components/driver-bottom-nav';
import { DriverHeader } from '@/components/driver-header';
import { DriverSessionGate } from '@/components/driver-session-gate';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <DriverSessionGate>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col">
        <DriverHeader />
        <main className="flex-1">{children}</main>
        <DriverBottomNav />
      </div>
    </DriverSessionGate>
  );
}
