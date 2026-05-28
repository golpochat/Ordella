export type PageShortcutConfig = {
  /** Route prefix match (e.g. `/products`). */
  match: string;
  newHref?: string;
  supportsEdit?: boolean;
  supportsDelete?: boolean;
  supportsRefresh?: boolean;
  supportsTabNav?: boolean;
};

/** Standardized page-level shortcuts by route prefix (longest match wins). */
export const ADMIN_PAGE_SHORTCUTS: PageShortcutConfig[] = [
  { match: '/locations/new', supportsRefresh: true },
  { match: '/locations', newHref: '/locations/new', supportsRefresh: true },
  { match: '/products/new', supportsRefresh: true },
  { match: '/products', newHref: '/products/new', supportsRefresh: true },
  { match: '/orders', supportsRefresh: true },
  { match: '/inventory', supportsRefresh: true },
  { match: '/promotions', supportsRefresh: true },
  { match: '/staff', supportsRefresh: true },
  { match: '/crm', supportsRefresh: true },
  { match: '/marketing', supportsRefresh: true, supportsTabNav: true },
  { match: '/subscriptions', supportsRefresh: true },
  { match: '/reports', supportsRefresh: true, supportsTabNav: true },
  { match: '/analytics-insights', supportsRefresh: true, supportsTabNav: true },
  { match: '/forecasting', supportsRefresh: true, supportsTabNav: true },
  { match: '/audit-logs', supportsRefresh: true },
  { match: '/settings', supportsRefresh: true, supportsTabNav: true },
  { match: '/dashboard', supportsRefresh: true },
];

export function resolvePageShortcutConfig(pathname: string): PageShortcutConfig | null {
  const sorted = [...ADMIN_PAGE_SHORTCUTS].sort((a, b) => b.match.length - a.match.length);
  return sorted.find((entry) => pathname === entry.match || pathname.startsWith(`${entry.match}/`)) ?? null;
}
