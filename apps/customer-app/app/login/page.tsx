import { Logo, Stack } from '@shared-ui';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <Stack
      gap="xl"
      align="center"
      className="min-h-screen justify-center p-4"
    >
      <Logo variant="full" size="lg" color="auto" />
      <LoginForm />
    </Stack>
  );
}
