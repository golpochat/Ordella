import { Badge, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@shared-ui';
import type { Plan } from '@/lib/plans';
import { CtaButton } from './cta-button';
type PricingCardProps = {
  plan: Plan;
};

export function PricingCard({ plan }: PricingCardProps) {
  const isEnterprise = plan.id === 'enterprise';

  return (
    <Card
      className={`flex h-full flex-col ${plan.highlighted ? 'border-brand shadow-md ring-1 ring-brand/20' : ''}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{plan.name}</CardTitle>
          {plan.highlighted ? <Badge>Most popular</Badge> : null}
        </div>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
        <div className="pt-2">
          <span className="text-3xl font-bold">{plan.price}</span>
          <span className="text-sm text-muted-foreground"> {plan.priceDetail}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {plan.locations} location{plan.locations !== '1' && plan.locations !== 'Unlimited' ? 's' : ''} ·{' '}
          {plan.ordersPerMonth} orders/mo
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 text-sm">
          {plan.features.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-brand" aria-hidden>
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isEnterprise ? (
          <CtaButton href="/contact" variant="outline" className="w-full" utmContent={`pricing_${plan.id}`}>
            {plan.cta}
          </CtaButton>
        ) : (
          <CtaButton
            plan={plan.id === 'free' || plan.id === 'starter' || plan.id === 'pro' ? plan.id : 'free'}
            utmContent={`pricing_${plan.id}`}
            className="w-full"
            variant={plan.highlighted ? 'default' : 'outline'}
          >
            {plan.cta}
          </CtaButton>
        )}
      </CardFooter>
    </Card>
  );
}
