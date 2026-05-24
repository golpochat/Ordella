/**
 * Product screenshot assets under /public/screenshots.
 * Regenerate with: npm run capture:screenshots --workspace=@ordella/marketing
 */

export const SCREENSHOT_IDS = [
  'admin-dashboard',
  'admin-products',
  'admin-branding',
  'admin-billing',
  'pos-orders',
  'storefront-menu',
  'driver-delivery',
  'customer-orders',
  'kds-kitchen',
  'architecture-overview',
] as const;

export type ScreenshotId = (typeof SCREENSHOT_IDS)[number];

export type ScreenshotFrameType = 'browser' | 'device';

export type ScreenshotMeta = {
  id: ScreenshotId;
  src: string;
  alt: string;
  frame: ScreenshotFrameType;
  width: number;
  height: number;
};

export const SCREENSHOTS: Record<ScreenshotId, ScreenshotMeta> = {
  'admin-dashboard': {
    id: 'admin-dashboard',
    src: '/screenshots/admin-dashboard.png',
    alt: 'Ordella admin dashboard showing sales overview and recent orders for Bella Market',
    frame: 'browser',
    width: 1200,
    height: 750,
  },
  'admin-products': {
    id: 'admin-products',
    src: '/screenshots/admin-products.png',
    alt: 'Ordella admin catalog overview with categories and pricing',
    frame: 'browser',
    width: 1200,
    height: 750,
  },
  'admin-branding': {
    id: 'admin-branding',
    src: '/screenshots/admin-branding.png',
    alt: 'Ordella branding settings with logo upload and theme colors',
    frame: 'browser',
    width: 1200,
    height: 750,
  },
  'admin-billing': {
    id: 'admin-billing',
    src: '/screenshots/admin-billing.png',
    alt: 'Ordella billing settings showing plan, usage, and subscription status',
    frame: 'browser',
    width: 1200,
    height: 750,
  },
  'pos-orders': {
    id: 'pos-orders',
    src: '/screenshots/pos-orders.png',
    alt: 'Ordella POS catalog grid and checkout cart during in-store order taking',
    frame: 'browser',
    width: 1200,
    height: 750,
  },
  'storefront-menu': {
    id: 'storefront-menu',
    src: '/screenshots/storefront-menu.png',
    alt: 'Bella Market mobile storefront catalog with categories and add to cart',
    frame: 'device',
    width: 390,
    height: 780,
  },
  'driver-delivery': {
    id: 'driver-delivery',
    src: '/screenshots/driver-delivery.png',
    alt: 'Ordella driver app delivery queue with active drop-offs',
    frame: 'device',
    width: 390,
    height: 780,
  },
  'customer-orders': {
    id: 'customer-orders',
    src: '/screenshots/customer-orders.png',
    alt: 'Ordella customer app order history with reorder actions',
    frame: 'device',
    width: 390,
    height: 780,
  },
  'kds-kitchen': {
    id: 'kds-kitchen',
    src: '/screenshots/kds-kitchen.png',
    alt: 'Ordella fulfillment display with station columns and active tickets',
    frame: 'browser',
    width: 1200,
    height: 750,
  },
  'architecture-overview': {
    id: 'architecture-overview',
    src: '/screenshots/architecture-overview.png',
    alt: 'Diagram of Ordella connecting storefront, POS, API, fulfillment display, admin, and driver apps',
    frame: 'browser',
    width: 1200,
    height: 750,
  },
};

/** Legacy variant keys used across marketing pages. */
export const VARIANT_TO_SCREENSHOT: Record<string, ScreenshotId> = {
  dashboard: 'admin-dashboard',
  pos: 'pos-orders',
  storefront: 'storefront-menu',
  mobile: 'customer-orders',
  kds: 'kds-kitchen',
  architecture: 'architecture-overview',
};

export function getScreenshot(id: ScreenshotId): ScreenshotMeta {
  return SCREENSHOTS[id];
}

export function resolveScreenshotId(idOrVariant: ScreenshotId | string): ScreenshotId {
  if (idOrVariant in SCREENSHOTS) {
    return idOrVariant as ScreenshotId;
  }
  return VARIANT_TO_SCREENSHOT[idOrVariant] ?? 'admin-dashboard';
}
