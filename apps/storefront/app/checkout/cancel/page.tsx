import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Payment cancelled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Your card payment was not completed. Your cart is unchanged.</p>
          <Button asChild className="h-11">
            <Link href="/checkout">Return to checkout</Link>
          </Button>
          <Button asChild variant="outline" className="h-11">
            <Link href="/cart">View cart</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
