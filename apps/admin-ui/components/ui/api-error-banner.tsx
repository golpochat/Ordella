import { Card, CardContent } from '@shared-ui';

export function ApiErrorBanner({ message }: { message: string }) {
  return (
    <Card className="mb-4 border-destructive">
      <CardContent className="pt-6 text-sm text-destructive">{message}</CardContent>
    </Card>
  );
}
