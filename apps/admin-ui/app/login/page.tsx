import { LoginForm } from '@/components/auth/login-form';
import { MarketingAttributionCapture } from '@/components/auth/marketing-attribution-capture';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Logo } from '@shared-ui';

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
