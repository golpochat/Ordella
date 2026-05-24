import type { LucideIcon } from 'lucide-react';
import type { ScreenshotId } from '@/lib/screenshots';
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
  screenshotImage: ScreenshotId;
};

export const valuePillars: FeaturePillar[] = [
  {
    id: 'pos',
    title: 'Unified POS',
    description: 'Fast in-store checkout, receipts, and fulfillment tickets synced in real time.',
    icon: Monitor,
    screenshotLabel: 'POS checkout',
    screenshotImage: 'pos-orders',
  },
  {
    id: 'storefront',
    title: 'Online ordering',
    description: 'Branded storefront with basket, checkout, and live order tracking.',
    icon: Globe,
    screenshotLabel: 'Storefront catalog',
    screenshotImage: 'storefront-menu',
  },
  {
    id: 'delivery',
    title: 'Delivery & drivers',
    description: 'Assign deliveries, driver mobile app, and status updates to customers.',
    icon: Truck,
    screenshotLabel: 'Driver tasks',
    screenshotImage: 'driver-delivery',
  },
  {
    id: 'customer',
    title: 'Customer app',
    description: 'Order history, reorder, and saved addresses in your brand.',
    icon: Smartphone,
    screenshotLabel: 'Customer orders',
    screenshotImage: 'customer-orders',
  },
  {
    id: 'control',
    title: 'Multi-tenant control',
    description: 'Admin, roles, billing, and per-tenant branding on your domain.',
    icon: Layers,
    screenshotLabel: 'Admin dashboard',
    screenshotImage: 'admin-dashboard',
  },
];

export type FeatureGridItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const featureGridItems: FeatureGridItem[] = [
  { title: 'In-store POS', description: 'Quick checkout built for in-store, pickup, and counter sales.', icon: Monitor },
  { title: 'Online catalog', description: 'Mobile-first ordering for customers.', icon: UtensilsCrossed },
  { title: 'Fulfillment display', description: 'Real-time tickets and prep states.', icon: LayoutDashboard },
  { title: 'Delivery ops', description: 'Driver assignments and proof of delivery.', icon: Truck },
  { title: 'Customer accounts', description: 'History, reorder, and tracking.', icon: Users },
  { title: 'Admin dashboard', description: 'Catalog, orders, inventory, and staff.', icon: LayoutDashboard },
  { title: 'Promotions', description: 'Discounts and campaigns (Pro).', icon: ShoppingBag },
  { title: 'Inventory', description: 'Stock levels and adjustments.', icon: Layers },
  { title: 'Reports', description: 'Sales, delivery, and inventory insights.', icon: BarChart3 },
  { title: 'Stripe billing', description: 'Subscriptions and usage limits.', icon: CreditCard },
  { title: 'Branding', description: 'Logo, colors, and theme presets.', icon: Palette },
  { title: 'Custom domains', description: 'www.yourbusiness.com mapped to your tenant.', icon: Globe },
];

export type FeatureModule = {
  id: string;
  title: string;
  headline: string;
  bullets: string[];
  screenshotLabel: string;
  screenshotImage: ScreenshotId;
  docPath: string;
};

export const featureModules: FeatureModule[] = [
  {
    id: 'pos',
    title: 'POS',
    headline: 'In-store sales without friction',
    bullets: ['Quick cart and modifiers', 'Cash and card payments', 'Receipts and fulfillment sync'],
    screenshotLabel: 'POS — cart & checkout',
    screenshotImage: 'pos-orders',
    docPath: '/docs/pos',
  },
  {
    id: 'storefront',
    title: 'Online ordering',
    headline: 'Your catalog, your domain, your brand',
    bullets: ['Commission-free direct orders', 'Customer checkout and tracking', 'Themed mobile experience'],
    screenshotLabel: 'Storefront — catalog & tracking',
    screenshotImage: 'storefront-menu',
    docPath: '/docs/storefront',
  },
  {
    id: 'delivery',
    title: 'Delivery',
    headline: 'From fulfillment to doorstep',
    bullets: ['Assign drivers from admin', 'Driver app with live status', 'Customer delivery updates'],
    screenshotLabel: 'Driver app — tasks',
    screenshotImage: 'driver-delivery',
    docPath: '/docs/delivery',
  },
  {
    id: 'customer',
    title: 'Customer app',
    headline: 'Customers who come back',
    bullets: ['Order history and reorder', 'Saved addresses', 'Live order status'],
    screenshotLabel: 'Customer app — home',
    screenshotImage: 'customer-orders',
    docPath: '/docs/getting-started',
  },
  {
    id: 'kds',
    title: 'Fulfillment display',
    headline: 'Fulfillment clarity in real time',
    bullets: ['Station-based ticket views', 'Per-item prep tracking', 'WebSocket updates'],
    screenshotLabel: 'Fulfillment display — active tickets',
    screenshotImage: 'kds-kitchen',
    docPath: '/docs/getting-started',
  },
  {
    id: 'admin',
    title: 'Admin dashboard',
    headline: 'Command center for your brand',
    bullets: ['Products, categories, modifiers', 'Orders and overrides', 'Staff, roles, and settings'],
    screenshotLabel: 'Admin — catalog overview',
    screenshotImage: 'admin-products',
    docPath: '/docs/admin',
  },
  {
    id: 'branding',
    title: 'Branding & theming',
    headline: 'Look like you, not like us',
    bullets: ['Logo and color palette', 'Light, dark, and custom presets', 'Consistent across all apps'],
    screenshotLabel: 'Admin — branding',
    screenshotImage: 'admin-branding',
    docPath: '/docs/branding',
  },
  {
    id: 'billing',
    title: 'Billing & reporting',
    headline: 'Predictable SaaS pricing',
    bullets: ['Plans tied to business locations and orders', 'Stripe invoices in admin', 'Sales and ops reports'],
    screenshotLabel: 'Admin — billing & reports',
    screenshotImage: 'admin-billing',
    docPath: '/docs/billing',
  },
];
