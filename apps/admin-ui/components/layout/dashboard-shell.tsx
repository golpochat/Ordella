'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn, ContentArea, Flex, IconButton, Logo, PageContainer, ShortcutHint, TopNav } from '@shared-ui';
import {
  buildSidebarSections,
  Sidebar,
  type AdminNavGroupDef,
} from '@/components/ui/admin-nav';
import { DASHBOARD_NAV } from '@/lib/navigation';
import {
  ADMIN_MAIN_CONTENT_ID,
  useDrawerFocusTrap,
  useEscapeToClose,
} from '@/components/ui/admin-a11y';
import { MotionOverlay, odsDrawerPanel } from '@/components/ui/admin-motion';
import { AdminLocaleSwitcher, useTranslation } from '@/components/ui/admin-i18n';
import { AdminThemeSwitcher } from '@/components/ui/admin-theme';
import { LocationSwitcherBar } from './location-switcher-bar';
import { TenantSwitcher } from './tenant-switcher';
import { UserMenu } from './user-menu';

function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

const NAV_GROUP_DEFS: AdminNavGroupDef[] = [
  {
    id: 'overview',
    itemIds: ['dashboard', 'analytics-insights', 'ai-assistant', 'reports', 'forecasting'],
  },
  {
    id: 'commerce',
    itemIds: [
      'catalog',
      'bundles',
      'products',
      'inventory',
      'multi-store-inventory',
      'orders',
      'promotions',
      'marketing',
      'crm',
      'loyalty',
      'giftcards',
      'subscriptions',
    ],
  },
  {
    id: 'operations',
    itemIds: [
      'locations',
      'staff',
      'staff-scheduling',
      'warehouse',
      'picking-mode',
      'stock-transfers',
      'suppliers',
      'supplier-portal',
      'purchase-orders',
      'replenishment',
    ],
  },
  {
    id: 'platform',
    itemIds: [
      'orchestration',
      'event-bus',
      'data-lake',
      'digital-twins',
      'autonomous-retail',
      'integrations-hub',
      'developer',
      'settings',
      'audit-logs',
      'enterprise',
      'franchise-hq',
      'compliance-suite',
      'cloud-platform',
      'retail-genome',
      'partner-network',
      'app-store',
      'offline-sync',
      'globalization',
      'devices',
      'recommendations',
      'support',
      'notifications',
    ],
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMatchMedia('(max-width: 480px)');
  const isTablet = useMatchMedia('(min-width: 481px) and (max-width: 768px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userCollapsed, setUserCollapsed] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const collapsed = isTablet || (userCollapsed && !isMobile);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  useEscapeToClose(isMobile && mobileOpen, closeMobile);
  useDrawerFocusTrap(isMobile && mobileOpen, mobileNavRef);

  useEffect(() => {
    if (!isMobile) return;
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, mobileOpen]);

  const sections = useMemo(
    () => buildSidebarSections(DASHBOARD_NAV, NAV_GROUP_DEFS, pathname, router, t),
    [pathname, router, t],
  );

  const sidebar = (
    <Sidebar
      brand={
        <Link href="/dashboard" className="inline-flex" onClick={closeMobile}>
          <Logo variant={collapsed ? 'mark' : 'full'} size="sm" color="auto" />
        </Link>
      }
      sections={sections}
      collapsed={collapsed}
      drawer={isMobile}
      onNavigate={closeMobile}
      footer={
        !isMobile ? (
          <IconButton
            aria-label={collapsed ? t('shell.expandSidebar') : t('shell.collapseSidebar')}
            onClick={() => setUserCollapsed((value) => !value)}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" aria-hidden /> : <PanelLeftClose className="h-5 w-5" aria-hidden />}
          </IconButton>
        ) : null
      }
    />
  );

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-background">
      {isMobile ? (
        <>
          {mobileOpen ? (
            <MotionOverlay aria-label={t('shell.closeNavigation')} onClick={closeMobile} />
          ) : null}
          <div
            id="admin-primary-nav"
            ref={mobileNavRef}
            className={cn(
              'fixed inset-y-0 start-0 z-50 flex translate-x-0',
              odsDrawerPanel,
              !mobileOpen && '-translate-x-full rtl:translate-x-full',
            )}
            aria-hidden={!mobileOpen}
          >
            {sidebar}
          </div>
        </>
      ) : (
        <div className="flex shrink-0">{sidebar}</div>
      )}

      <Flex direction="col" className="min-h-0 min-w-0 flex-1">
        <TopNav
          title={t('shell.adminTitle')}
          subtitle={t('shell.adminSubtitle')}
          leading={
            <Flex gap="sm" align="center">
              {isMobile ? (
                <IconButton
                  aria-label={mobileOpen ? t('shell.closeNavigation') : t('shell.openNavigation')}
                  aria-expanded={mobileOpen}
                  aria-controls="admin-primary-nav"
                  onClick={() => setMobileOpen((open) => !open)}
                >
                  <Menu className="h-5 w-5" aria-hidden />
                </IconButton>
              ) : null}
              <UserMenu />
            </Flex>
          }
          trailing={
            <Flex gap="md" align="center" wrap className="hidden min-[481px]:flex">
              <AdminLocaleSwitcher />
              <AdminThemeSwitcher />
              <span className="hidden min-[1024px]:inline-flex" title="Keyboard shortcuts">
                <ShortcutHint combo="shift+/" aria-label="Show keyboard shortcuts" />
              </span>
              <LocationSwitcherBar />
              <TenantSwitcher />
            </Flex>
          }
        />
        <PageContainer id={ADMIN_MAIN_CONTENT_ID} tabIndex={-1}>
          <ContentArea gap="lg" className="min-h-0 flex-1">
            {children}
          </ContentArea>
        </PageContainer>
      </Flex>
    </div>
  );
}
