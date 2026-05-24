import { KdsHeader } from '@/components/kds-header';

export default function KdsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <KdsHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
