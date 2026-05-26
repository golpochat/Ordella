import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-[var(--theme-spacing)] py-[var(--storefront-section-padding)]">
      <Card className="rounded-[var(--storefront-radius)]">
        <CardHeader>
          <CardTitle>Payment cancelled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-[var(--storefront-card-padding)] text-sm text-muted-foreground">
          <p>Your card payment was not completed. Your cart is unchanged.</p>
          <Button asChild className="h-11 rounded-[var(--storefront-radius)]">
            <Link href="/checkout">Return to checkout</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-[var(--storefront-radius)]">
            <Link href="/cart">View cart</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
