import { Logo } from '@shared-ui';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <Logo variant="full" size="lg" color="auto" />
      <LoginForm />
    </div>
  );
}
