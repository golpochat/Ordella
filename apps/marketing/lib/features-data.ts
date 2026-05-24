import type { LucideIcon } from 'lucide-react';
import {
  CreditCard,
  Globe,
  LayoutDashboard,
  Monitor,
  Palette,
  ShoppingBag,
  Smartphone,
  Truck,
  Users,
  UtensilsCrossed,
  BarChart3,
  Layers,
} from 'lucide-react';

export type FeaturePillar = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  screenshotLabel: string;
};

export const valuePillars: FeaturePillar[] = [
  {
    id: 'pos',
    title: 'Unified POS',
    description: 'Fast in-store checkout, receipts, and kitchen tickets synced in real time.',
    icon: Monitor,
    screenshotLabel: 'POS checkout',
  },
  {
    id: 'storefront',
    title: 'Online ordering',
    description: 'Branded storefront with basket, checkout, and live order tracking.',
    icon: Globe,
    screenshotLabel: 'Storefront menu',
  },
  {
    id: 'delivery',
    title: 'Delivery & drivers',
    description: 'Assign deliveries, driver mobile app, and status updates to customers.',
    icon: Truck,
    screenshotLabel: 'Driver tasks',
  },
  {
    id: 'customer',
    title: 'Customer app',
    description: 'Order history, reorder, and saved addresses in your brand.',
    icon: Smartphone,
    screenshotLabel: 'Customer orders',
  },
  {
    id: 'control',
    title: 'Multi-tenant control',
    description: 'Admin, roles, billing, and per-tenant branding on your domain.',
    icon: Layers,
    screenshotLabel: 'Admin dashboard',
  },
];

export type FeatureGridItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const featureGridItems: FeatureGridItem[] = [
  { title: 'In-store POS', description: 'Quick-service checkout built for speed.', icon: Monitor },
  { title: 'Online menu', description: 'Mobile-first ordering for guests.', icon: UtensilsCrossed },
  { title: 'Kitchen display', description: 'Real-time tickets and prep states.', icon: LayoutDashboard },
  { title: 'Delivery ops', description: 'Driver assignments and proof of delivery.', icon: Truck },
  { title: 'Customer accounts', description: 'History, reorder, and tracking.', icon: Users },
  { title: 'Admin dashboard', description: 'Menu, orders, inventory, and staff.', icon: LayoutDashboard },
  { title: 'Promotions', description: 'Discounts and campaigns (Pro).', icon: ShoppingBag },
  { title: 'Inventory', description: 'Stock levels and adjustments.', icon: Layers },
  { title: 'Reports', description: 'Sales, delivery, and inventory insights.', icon: BarChart3 },
  { title: 'Stripe billing', description: 'Subscriptions and usage limits.', icon: CreditCard },
  { title: 'Branding', description: 'Logo, colors, and theme presets.', icon: Palette },
  { title: 'Custom domains', description: 'www.yourrestaurant.com mapped to your tenant.', icon: Globe },
];

export type FeatureModule = {
  id: string;
  title: string;
  headline: string;
  bullets: string[];
  screenshotLabel: string;
  docPath: string;
};

export const featureModules: FeatureModule[] = [
  {
    id: 'pos',
    title: 'POS',
    headline: 'In-store sales without friction',
    bullets: ['Quick cart and modifiers', 'Cash and card payments', 'Receipts and KDS sync'],
    screenshotLabel: 'POS — cart & checkout',
    docPath: '/docs/pos/pos-setup',
  },
  {
    id: 'storefront',
    title: 'Online ordering',
    headline: 'Your menu, your domain, your brand',
    bullets: ['Commission-free direct orders', 'Guest checkout and tracking', 'Themed mobile experience'],
    screenshotLabel: 'Storefront — menu & tracking',
    docPath: '/docs/storefront/storefront-overview',
  },
  {
    id: 'delivery',
    title: 'Delivery',
    headline: 'From kitchen to doorstep',
    bullets: ['Assign drivers from admin', 'Driver app with live status', 'Customer delivery updates'],
    screenshotLabel: 'Driver app — tasks',
    docPath: '/docs/delivery/enable-delivery',
  },
  {
    id: 'customer',
    title: 'Customer app',
    headline: 'Guests who come back',
    bullets: ['Order history and reorder', 'Saved addresses', 'Live order status'],
    screenshotLabel: 'Customer app — home',
    docPath: '/docs/getting-started/what-is-ordella',
  },
  {
    id: 'kds',
    title: 'KDS',
    headline: 'Kitchen clarity in real time',
    bullets: ['Station-based ticket views', 'Per-item prep tracking', 'WebSocket updates'],
    screenshotLabel: 'KDS — active tickets',
    docPath: '/docs/getting-started/architecture-overview',
  },
  {
    id: 'admin',
    title: 'Admin dashboard',
    headline: 'Command center for your brand',
    bullets: ['Products, categories, modifiers', 'Orders and overrides', 'Staff, roles, and settings'],
    screenshotLabel: 'Admin — products',
    docPath: '/docs/admin/admin-overview',
  },
  {
    id: 'branding',
    title: 'Branding & theming',
    headline: 'Look like you, not like us',
    bullets: ['Logo and color palette', 'Light, dark, and custom presets', 'Consistent across all apps'],
    screenshotLabel: 'Admin — branding',
    docPath: '/docs/branding/branding-overview',
  },
  {
    id: 'billing',
    title: 'Billing & reporting',
    headline: 'Predictable SaaS pricing',
    bullets: ['Plans tied to locations and orders', 'Stripe invoices in admin', 'Sales and ops reports'],
    screenshotLabel: 'Admin — billing & reports',
    docPath: '/docs/billing/plans-and-limits',
  },
];
