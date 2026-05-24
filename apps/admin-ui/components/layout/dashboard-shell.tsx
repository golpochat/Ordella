'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo, Sidebar, Topbar } from '@shared-ui';
import { DASHBOARD_NAV } from '@/lib/navigation';
import { TenantSwitcher } from './tenant-switcher';
import { UserMenu } from './user-menu';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const items = DASHBOARD_NAV.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    active: pathname === item.href || pathname.startsWith(`${item.href}/`),
    icon: <item.icon className="h-4 w-4 shrink-0" />,
    onClick: () => router.push(item.href),
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        brand={
          <Link href="/products" className="inline-flex">
            <Logo variant="full" size="sm" color="auto" />
          </Link>
        }
        items={items}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Admin" trailing={<TenantSwitcher />} leading={<UserMenu />} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
