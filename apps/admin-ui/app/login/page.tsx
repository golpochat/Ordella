import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared-ui';

type LoginPageProps = {
  searchParams: { from?: string; error?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const errorMessage =
    searchParams.error === 'tenant_required'
      ? 'Select a tenant to continue.'
      : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ordella Admin</CardTitle>
          <CardDescription>Sign in with your staff account</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage ? (
            <p className="mb-4 text-sm text-destructive">{errorMessage}</p>
          ) : null}
          <LoginForm redirectTo={searchParams.from ?? '/products'} />
        </CardContent>
      </Card>
    </div>
  );
}
