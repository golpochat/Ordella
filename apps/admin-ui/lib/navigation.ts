import type { LucideIcon } from 'lucide-react';
import {
  ClipboardList,
  Code2,
  Globe,
  Database,
  GitBranch,
  Layers,
  Bot,
  CreditCard,
  FileClock,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  MapPin,
  Package,
  Percent,
  Repeat,
  Gift,
  Settings,
  ShoppingCart,
  Sparkles,
  Building2,
  Users,
  Truck,
  Warehouse,
  Boxes,
  TrendingUp,
  Shield,
  Cloud,
  Network,
} from 'lucide-react';

export type DashboardNavEntry = {
  id: string;
  /** i18n key under `nav.*` (defaults to `nav.{id}`). */
  labelKey?: string;
  href: string;
  icon: LucideIcon;
};

/** @deprecated Use `DashboardNavEntry` */
export type NavItem = DashboardNavEntry;

export function navLabelKey(id: string): string {
  return `nav.${id}`;
}

export const DASHBOARD_NAV: DashboardNavEntry[] = [
  { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'ai-assistant', href: '/ai-assistant', icon: Sparkles },
  { id: 'analytics-insights', href: '/analytics-insights', icon: TrendingUp },
  { id: 'enterprise', href: '/enterprise', icon: Building2 },
  { id: 'franchise-hq', href: '/franchise-hq/dashboard', icon: Building2 },
  { id: 'locations', href: '/locations', icon: MapPin },
  { id: 'catalog', href: '/catalog', icon: Package },
  { id: 'bundles', href: '/catalog/bundles', icon: Package },
  { id: 'products', href: '/products', icon: Package },
  { id: 'inventory', href: '/inventory', icon: Warehouse },
  { id: 'multi-store-inventory', href: '/inventory/multi-store', icon: Warehouse },
  { id: 'replenishment', href: '/replenishment', icon: Repeat },
  { id: 'offline-sync', href: '/offline-sync', icon: Repeat },
  { id: 'event-bus', href: '/event-bus', icon: Code2 },
  { id: 'globalization', href: '/globalization', icon: Globe },
  { id: 'data-lake', href: '/data-lake', icon: Database },
  { id: 'orchestration', href: '/orchestration', icon: GitBranch },
  { id: 'digital-twins', href: '/digital-twins', icon: Layers },
  { id: 'autonomous-retail', href: '/autonomous-retail', icon: Bot },
  { id: 'warehouse', href: '/warehouse', icon: Boxes },
  { id: 'devices', href: '/devices', icon: Boxes },
  { id: 'picking-mode', href: '/warehouse/picking', icon: Boxes },
  { id: 'stock-transfers', href: '/warehouse/transfers', icon: Truck },
  { id: 'suppliers', href: '/suppliers', icon: Truck },
  { id: 'supplier-portal', href: '/supplier-portal', icon: MessageSquare },
  { id: 'purchase-orders', href: '/purchase-orders', icon: ClipboardList },
  { id: 'staff', href: '/staff', icon: Users },
  { id: 'staff-scheduling', href: '/staff/scheduling', icon: FileClock },
  { id: 'crm', href: '/crm', icon: Users },
  { id: 'notifications', href: '/notifications', icon: MessageSquare },
  { id: 'loyalty', href: '/loyalty', icon: Gift },
  { id: 'giftcards', href: '/giftcards', icon: CreditCard },
  { id: 'orders', href: '/orders', icon: ShoppingCart },
  { id: 'subscriptions', href: '/subscriptions', icon: Repeat },
  { id: 'support', href: '/support', icon: MessageSquare },
  { id: 'promotions', href: '/promotions', icon: Percent },
  { id: 'recommendations', href: '/recommendations', icon: Sparkles },
  { id: 'marketing', href: '/marketing/campaigns', icon: Megaphone },
  { id: 'audit-logs', href: '/audit-logs', icon: FileClock },
  { id: 'app-store', href: '/app-store', icon: Package },
  { id: 'partner-network', href: '/partner-network', icon: Users },
  { id: 'compliance-suite', href: '/compliance-suite', icon: Shield },
  { id: 'cloud-platform', href: '/cloud-platform', icon: Cloud },
  { id: 'retail-genome', href: '/retail-genome', icon: Network },
  { id: 'integrations-hub', href: '/integrations-hub', icon: Code2 },
  { id: 'developer', href: '/developer', icon: Code2 },
  { id: 'reports', href: '/reports', icon: ClipboardList },
  { id: 'forecasting', href: '/forecasting', icon: TrendingUp },
  { id: 'settings', href: '/settings', icon: Settings },
];

export type SubNavEntry = { labelKey: string; href: string };

export const PRODUCTS_SUBNAV: SubNavEntry[] = [
  { labelKey: 'subnav.products.all', href: '/products' },
  { labelKey: 'subnav.products.categories', href: '/products/categories' },
  { labelKey: 'subnav.products.modifiers', href: '/products/modifiers' },
];

export const CATALOG_SUBNAV: SubNavEntry[] = [
  { labelKey: 'subnav.catalog.builder', href: '/catalog' },
  { labelKey: 'subnav.catalog.bundles', href: '/catalog/bundles' },
];

export const INVENTORY_SUBNAV: SubNavEntry[] = [
  { labelKey: 'subnav.inventory.stock', href: '/inventory' },
  { labelKey: 'subnav.inventory.multiStore', href: '/inventory/multi-store' },
  { labelKey: 'subnav.inventory.lowStock', href: '/inventory/low-stock' },
  { labelKey: 'subnav.inventory.movements', href: '/inventory/movements' },
  { labelKey: 'subnav.inventory.replenishment', href: '/replenishment' },
];

export const REPORTS_SUBNAV: SubNavEntry[] = [
  { labelKey: 'subnav.reports.dashboards', href: '/reports' },
  { labelKey: 'subnav.reports.analyticsHome', href: '/dashboard' },
  { labelKey: 'subnav.reports.dailySales', href: '/reports/sales' },
  { labelKey: 'subnav.reports.inventory', href: '/reports/inventory' },
  { labelKey: 'subnav.reports.delivery', href: '/reports/delivery' },
  { labelKey: 'subnav.reports.suppliers', href: '/reports?reportType=supplier' },
  { labelKey: 'subnav.reports.promotions', href: '/reports/promotions' },
];

export const MARKETING_SUBNAV: SubNavEntry[] = [
  { labelKey: 'subnav.marketing.campaigns', href: '/marketing/campaigns' },
  { labelKey: 'subnav.marketing.segments', href: '/marketing/segments' },
  { labelKey: 'subnav.marketing.journeys', href: '/marketing/journeys' },
];

export const CRM_SUBNAV: SubNavEntry[] = [
  { labelKey: 'subnav.crm.dashboard', href: '/crm' },
  { labelKey: 'subnav.crm.segments', href: '/marketing/segments' },
  { labelKey: 'subnav.crm.campaigns', href: '/marketing/campaigns' },
];

export const FRANCHISE_HQ_SUBNAV: SubNavEntry[] = [
  { labelKey: 'subnav.franchiseHq.overview', href: '/franchise-hq/dashboard' },
  { labelKey: 'subnav.franchiseHq.locations', href: '/franchise-hq/locations' },
  { labelKey: 'subnav.franchiseHq.orders', href: '/franchise-hq/orders' },
  { labelKey: 'subnav.franchiseHq.inventory', href: '/franchise-hq/inventory' },
  { labelKey: 'subnav.franchiseHq.reports', href: '/franchise-hq/reports' },
  { labelKey: 'subnav.franchiseHq.forecasting', href: '/franchise-hq/forecasting' },
  { labelKey: 'subnav.franchiseHq.replenishment', href: '/franchise-hq/replenishment' },
  { labelKey: 'subnav.franchiseHq.supplierPerformance', href: '/franchise-hq/supplier-performance' },
  { labelKey: 'subnav.franchiseHq.brandCatalog', href: '/franchise-hq/catalog' },
  { labelKey: 'subnav.franchiseHq.routing', href: '/franchise-hq/routing' },
  { labelKey: 'subnav.franchiseHq.staff', href: '/franchise-hq/staff' },
];

export const SETTINGS_TABS = [
  { id: 'localization', labelKey: 'settings.tabs.localization' },
  { id: 'billing', labelKey: 'settings.tabs.billing' },
  { id: 'branding', labelKey: 'settings.tabs.branding' },
  { id: 'storefront-theme', labelKey: 'settings.tabs.storefrontTheme' },
  { id: 'business', labelKey: 'settings.tabs.business' },
  { id: 'hours', labelKey: 'settings.tabs.hours' },
  { id: 'delivery', labelKey: 'settings.tabs.delivery' },
  { id: 'order-routing', labelKey: 'settings.tabs.orderRouting' },
  { id: 'enterprise-sso', labelKey: 'settings.tabs.enterpriseSso' },
  { id: 'payment', labelKey: 'settings.tabs.payment' },
  { id: 'pos', labelKey: 'settings.tabs.pos' },
  { id: 'pos-theme', labelKey: 'settings.tabs.posTheme' },
  { id: 'tax-compliance', labelKey: 'settings.tabs.taxCompliance' },
  { id: 'fulfillment', labelKey: 'settings.tabs.fulfillment' },
] as const;
