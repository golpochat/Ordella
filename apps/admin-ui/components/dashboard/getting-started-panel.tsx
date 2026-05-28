import { CardDescription, CardHeader, CardTitle, Grid } from '@shared-ui';
import { Card, CardBody, InteractiveCard } from '@/components/ui/admin-card';

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
      <CardBody>
        <Grid cols={1} gap="sm" className="min-[481px]:grid-cols-2">
          {LINKS.map((item) => (
            <InteractiveCard key={item.label} href={item.href}>
              <CardBody className="p-4">
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{item.description}</span>
              </CardBody>
            </InteractiveCard>
          ))}
        </Grid>
      </CardBody>
    </Card>
  );
}
