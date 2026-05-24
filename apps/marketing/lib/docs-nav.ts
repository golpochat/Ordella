export type DocCategory = {
  slug: string;
  title: string;
  articles: { slug: string; title: string }[];
};

export const docCategories: DocCategory[] = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    articles: [
      { slug: 'what-is-ordella', title: 'What is Ordella?' },
      { slug: 'architecture-overview', title: 'Architecture overview' },
    ],
  },
  {
    slug: 'tenant-onboarding',
    title: 'Tenant Onboarding',
    articles: [
      { slug: 'create-account', title: 'Create your account' },
      { slug: 'onboarding-wizard', title: 'Onboarding wizard' },
      { slug: 'go-live-checklist', title: 'Go-live checklist' },
    ],
  },
  {
    slug: 'admin',
    title: 'Admin',
    articles: [
      { slug: 'admin-overview', title: 'Admin overview' },
      { slug: 'manage-products', title: 'Manage products' },
    ],
  },
  {
    slug: 'pos',
    title: 'POS',
    articles: [{ slug: 'pos-setup', title: 'POS setup' }],
  },
  {
    slug: 'storefront',
    title: 'Storefront',
    articles: [
      { slug: 'storefront-overview', title: 'Storefront overview' },
      { slug: 'custom-domain', title: 'Custom domain' },
    ],
  },
  {
    slug: 'delivery',
    title: 'Delivery',
    articles: [{ slug: 'enable-delivery', title: 'Enable delivery' }],
  },
  {
    slug: 'branding',
    title: 'Branding & Theming',
    articles: [{ slug: 'branding-overview', title: 'Branding overview' }],
  },
  {
    slug: 'billing',
    title: 'Billing',
    articles: [
      { slug: 'plans-and-limits', title: 'Plans and limits' },
      { slug: 'upgrade-plan', title: 'Upgrade your plan' },
    ],
  },
];

export function findDocMeta(category: string, slug: string) {
  const cat = docCategories.find((c) => c.slug === category);
  const article = cat?.articles.find((a) => a.slug === slug);
  return { category: cat, article };
}
