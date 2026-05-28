import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { MarketingAttributionCapture } from '@/components/auth/marketing-attribution-capture';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Logo } from '@shared-ui';
import { FormErrorAlert } from '@/components/ui/admin-form-validation';

type LoginPageProps = {
  searchParams: {
    from?: string;
    error?: string;
    plan?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const errorMessage =
    searchParams.error === 'tenant_required'
      ? 'Select a tenant to continue.'
      : searchParams.error?.startsWith('sso')
        ? 'SSO sign-in could not be completed. Use email and password or contact your administrator.'
      : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <MarketingAttributionCapture
        plan={searchParams.plan}
        utmSource={searchParams.utm_source}
        utmMedium={searchParams.utm_medium}
        utmCampaign={searchParams.utm_campaign}
        utmContent={searchParams.utm_content}
      />
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mb-2">
            <Logo variant="full" size="lg" color="auto" />
          </div>
          <CardTitle>Admin</CardTitle>
          <CardDescription>Sign in with your staff account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage ? (
            <FormErrorAlert message={errorMessage} title="Sign in unavailable" className="mb-4" />
          ) : null}
          <LoginForm redirectTo={searchParams.from ?? '/dashboard'} />
          <p className="text-center text-sm text-muted-foreground">
            New to Ordella?{' '}
            <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

