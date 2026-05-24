export const DOC_CATEGORIES = [
  { id: 'getting-started', title: 'Getting Started', order: 1 },
  { id: 'tenant-onboarding', title: 'Tenant Onboarding', order: 2 },
  { id: 'admin', title: 'Admin', order: 3 },
  { id: 'pos', title: 'POS', order: 4 },
  { id: 'storefront', title: 'Storefront', order: 5 },
  { id: 'delivery', title: 'Delivery', order: 6 },
  { id: 'branding', title: 'Branding & Theming', order: 7 },
  { id: 'billing', title: 'Billing', order: 8 },
] as const;

export type DocCategoryId = (typeof DOC_CATEGORIES)[number]['id'];

const categoryIds = new Set<string>(DOC_CATEGORIES.map((c) => c.id));

export function isDocCategoryId(value: string): value is DocCategoryId {
  return categoryIds.has(value);
}

export function getCategoryTitle(id: DocCategoryId): string {
  return DOC_CATEGORIES.find((c) => c.id === id)?.title ?? id;
}
