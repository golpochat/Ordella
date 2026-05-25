import type { LucideIcon } from 'lucide-react';
import { BarChart3, ClipboardList, MessageSquare, Package, UserRound } from 'lucide-react';

export type SupplierNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export const SUPPLIER_NAV: SupplierNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: BarChart3 },
  { id: 'purchase-orders', label: 'Purchase Orders', href: '/purchase-orders', icon: ClipboardList },
  { id: 'catalog', label: 'Catalog', href: '/catalog', icon: Package },
  { id: 'messages', label: 'Messages', href: '/messages', icon: MessageSquare },
  { id: 'profile', label: 'Profile', href: '/profile', icon: UserRound },
];
