import { Card, CardContent, CardDescription, CardHeader, CardTitle, Logo } from '@shared-ui';
import { PosLoginForm } from '@/components/auth/pos-login-form';

export default function PosLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mb-2">
            <Logo variant="full" size="lg" color="auto" />
          </div>
          <CardTitle>POS Login</CardTitle>
          <CardDescription>Sign in with staff credentials or enterprise SSO.</CardDescription>
        </CardHeader>
        <CardContent>
          <PosLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
