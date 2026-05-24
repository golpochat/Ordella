import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared-ui';

const LINKS = [
  { href: '/catalog', label: 'Add your first item', description: 'Build your catalog with categories and items' },
  { href: '/settings', label: 'Add staff', description: 'Invite team members and assign roles' },
  { href: '/settings', label: 'Configure fulfillment', description: 'Pickup, delivery, and location hours' },
  { href: '/settings', label: 'Customize storefront', description: 'Branding, theme, and business info' },
  { href: '/settings', label: 'Connect payments', description: 'Billing and payment providers' },
] as const;

export function GettingStartedPanel() {
  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle>Getting started</CardTitle>
        <CardDescription>
          Your account is ready. Complete these steps to start selling across channels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2">
          {LINKS.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="block rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-accent/50"
              >
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{item.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
