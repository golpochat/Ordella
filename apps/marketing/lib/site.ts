export const siteConfig = {
  name: 'Ordella',
  tagline: 'Run every order channel from one platform.',
  description:
    'Ordella unifies in-store POS, online ordering, kitchen displays, delivery, and customer apps for multi-location restaurants.',
  url: process.env.NEXT_PUBLIC_MARKETING_URL ?? 'http://localhost:3006',
  ogImage: '/og-default.svg',
};

export function appSignupUrl(plan = 'free', utmContent?: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';
  const path = process.env.NEXT_PUBLIC_SIGNUP_PATH ?? '/login';
  const url = new URL(path, base);
  url.searchParams.set('plan', plan);
  url.searchParams.set('utm_source', 'marketing');
  url.searchParams.set('utm_medium', 'website');
  if (utmContent) {
    url.searchParams.set('utm_content', utmContent);
  }
  return url.toString();
}

export function adminLoginUrl(): string {
  const base = process.env.NEXT_PUBLIC_ADMIN_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';
  return new URL('/login', base).toString();
}
