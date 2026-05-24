import type { LucideIcon } from 'lucide-react';
import {
  ClipboardList,
  LayoutDashboard,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Warehouse,
} from 'lucide-react';

export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', href: '/products', icon: Package },
  { id: 'inventory', label: 'Inventory', href: '/inventory', icon: Warehouse },
  { id: 'orders', label: 'Orders', href: '/orders', icon: ShoppingCart },
  { id: 'promotions', label: 'Promotions', href: '/promotions', icon: Percent },
  { id: 'reports', label: 'Reports', href: '/reports', icon: ClipboardList },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
];

export const PRODUCTS_SUBNAV = [
  { label: 'All products', href: '/products' },
  { label: 'Categories', href: '/products/categories' },
  { label: 'Modifiers', href: '/products/modifiers' },
];

export const INVENTORY_SUBNAV = [
  { label: 'Stock levels', href: '/inventory' },
  { label: 'Movements', href: '/inventory/movements' },
];

export const REPORTS_SUBNAV = [
  { label: 'Daily sales', href: '/reports/sales' },
  { label: 'Inventory', href: '/reports/inventory' },
  { label: 'Delivery', href: '/reports/delivery' },
  { label: 'Promotions', href: '/reports/promotions' },
];

export const SETTINGS_TABS = [
  { id: 'billing', label: 'Billing' },
  { id: 'branding', label: 'Branding' },
  { id: 'business', label: 'Business' },
  { id: 'hours', label: 'Opening hours' },
  { id: 'delivery', label: 'Delivery zones' },
  { id: 'payment', label: 'Payment' },
  { id: 'pos', label: 'POS' },
] as const;
