import type { LucideIcon } from 'lucide-react';
import {
  ClipboardList,
  Code2,
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
} from 'lucide-react';

export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Analytics', href: '/dashboard', icon: LayoutDashboard },
  { id: 'franchise-hq', label: 'Franchise HQ', href: '/franchise-hq/dashboard', icon: Building2 },
  { id: 'locations', label: 'Locations', href: '/locations', icon: MapPin },
  { id: 'catalog', label: 'Catalog', href: '/catalog', icon: Package },
  { id: 'bundles', label: 'Bundles & Combos', href: '/catalog/bundles', icon: Package },
  { id: 'products', label: 'Products (legacy)', href: '/products', icon: Package },
  { id: 'inventory', label: 'Inventory', href: '/inventory', icon: Warehouse },
  { id: 'multi-store-inventory', label: 'Multi-Store Inventory', href: '/inventory/multi-store', icon: Warehouse },
  { id: 'warehouse', label: 'Warehouse Management', href: '/warehouse', icon: Boxes },
  { id: 'picking-mode', label: 'Picking Mode', href: '/warehouse/picking', icon: Boxes },
  { id: 'stock-transfers', label: 'Stock Transfers', href: '/warehouse/transfers', icon: Truck },
  { id: 'suppliers', label: 'Suppliers', href: '/suppliers', icon: Truck },
  { id: 'purchase-orders', label: 'Purchase Orders', href: '/purchase-orders', icon: ClipboardList },
  { id: 'staff', label: 'Staff', href: '/staff', icon: Users },
  { id: 'crm', label: 'CRM', href: '/crm', icon: Users },
  { id: 'notifications', label: 'Notifications', href: '/notifications', icon: MessageSquare },
  { id: 'loyalty', label: 'Loyalty & Rewards', href: '/loyalty', icon: Gift },
  { id: 'giftcards', label: 'Gift Cards & Store Credit', href: '/giftcards', icon: CreditCard },
  { id: 'orders', label: 'Orders', href: '/orders', icon: ShoppingCart },
  { id: 'subscriptions', label: 'Subscriptions', href: '/subscriptions', icon: Repeat },
  { id: 'promotions', label: 'Promotions & Discounts', href: '/promotions', icon: Percent },
  { id: 'recommendations', label: 'AI Recommendations', href: '/recommendations', icon: Sparkles },
  { id: 'marketing', label: 'Marketing', href: '/marketing/campaigns', icon: Megaphone },
  { id: 'audit-logs', label: 'Audit Logs', href: '/audit-logs', icon: FileClock },
  { id: 'developer', label: 'Developer', href: '/developer', icon: Code2 },
  { id: 'reports', label: 'Reports', href: '/reports', icon: ClipboardList },
  { id: 'forecasting', label: 'Forecasting', href: '/forecasting', icon: TrendingUp },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
];

export const PRODUCTS_SUBNAV = [
  { label: 'All products', href: '/products' },
  { label: 'Categories', href: '/products/categories' },
  { label: 'Modifiers', href: '/products/modifiers' },
];

export const CATALOG_SUBNAV = [
  { label: 'Catalog builder', href: '/catalog' },
  { label: 'Bundles & Combos', href: '/catalog/bundles' },
];

export const INVENTORY_SUBNAV = [
  { label: 'Stock levels', href: '/inventory' },
  { label: 'Multi-store inventory', href: '/inventory/multi-store' },
  { label: 'Low stock', href: '/inventory/low-stock' },
  { label: 'Movements', href: '/inventory/movements' },
];

export const REPORTS_SUBNAV = [
  { label: 'Enterprise Suite', href: '/reports' },
  { label: 'Analytics home', href: '/dashboard' },
  { label: 'Daily sales', href: '/reports/sales' },
  { label: 'Inventory', href: '/reports/inventory' },
  { label: 'Delivery', href: '/reports/delivery' },
  { label: 'Promotions', href: '/reports/promotions' },
];

export const MARKETING_SUBNAV = [
  { label: 'Campaigns', href: '/marketing/campaigns' },
  { label: 'Customer segments', href: '/marketing/segments' },
];

export const CRM_SUBNAV = [
  { label: 'CRM dashboard', href: '/crm' },
  { label: 'Customer segments', href: '/marketing/segments' },
  { label: 'Marketing campaigns', href: '/marketing/campaigns' },
];

export const FRANCHISE_HQ_SUBNAV = [
  { label: 'Overview', href: '/franchise-hq/dashboard' },
  { label: 'Locations', href: '/franchise-hq/locations' },
  { label: 'Orders', href: '/franchise-hq/orders' },
  { label: 'Inventory', href: '/franchise-hq/inventory' },
  { label: 'Reports', href: '/franchise-hq/reports' },
  { label: 'Forecasting', href: '/franchise-hq/forecasting' },
  { label: 'Brand Catalog', href: '/franchise-hq/catalog' },
  { label: 'Order Routing', href: '/franchise-hq/routing' },
  { label: 'Staff', href: '/franchise-hq/staff' },
];

export const SETTINGS_TABS = [
  { id: 'billing', label: 'Billing' },
  { id: 'branding', label: 'Branding' },
  { id: 'storefront-theme', label: 'Storefront Theme' },
  { id: 'business', label: 'Business' },
  { id: 'hours', label: 'Opening hours' },
  { id: 'delivery', label: 'Delivery zones' },
  { id: 'order-routing', label: 'Order Routing' },
  { id: 'payment', label: 'Payment' },
  { id: 'pos', label: 'POS' },
  { id: 'tax-compliance', label: 'Tax & Compliance' },
  { id: 'fulfillment', label: 'Fulfillment display' },
] as const;
