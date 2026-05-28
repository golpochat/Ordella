'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared-ui';
import { loginWithPassword, registerCustomer, requestPasswordReset } from '@/lib/api';
import { getTenantId } from '@/lib/config';
import {
  setCustomerId,
  setCustomerName,
  tokenStorage,
} from '@/lib/session';

export function LoginForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState(getTenantId);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = tokenStorage.getTenantId();
    if (stored) setTenantId(stored);
  }, []);

  const completeLogin = (result: {
    accessToken: string;
    refreshToken?: string;
    customerId: string;
    name?: string;
  }) => {
    tokenStorage.setAccessToken(result.accessToken);
    tokenStorage.setTenantId(tenantId);
    setCustomerId(result.customerId);
    setCustomerName(result.name ?? 'Customer');
    router.replace('/home');
  };

  const onPasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      tokenStorage.setTenantId(tenantId);
      const result = await loginWithPassword(email, password);
      completeLogin(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      tokenStorage.setTenantId(tenantId);
      const result = await registerCustomer({
        name,
        email,
        phone: phone.trim() || undefined,
        password,
      });
      completeLogin(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      tokenStorage.setTenantId(tenantId);
      await requestPasswordReset(email);
      setResetSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Customer sign in</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack gap="md">
          <FormField label="Tenant ID" htmlFor="tenantId" required>
            <Input
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              autoComplete="organization"
              required
            />
          </FormField>

          <Tabs defaultValue="password">
            <TabsList className="w-full">
              <TabsTrigger value="password" className="flex-1">
                Password
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1">
                Register
              </TabsTrigger>
              <TabsTrigger value="reset" className="flex-1">
                Reset
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="mt-4">
              <form onSubmit={(e) => void onPasswordLogin(e)}>
                <Stack gap="md">
                  <FormField label="Email" htmlFor="email" required>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </FormField>
                  <FormField label="Password" htmlFor="password" required>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </FormField>
                  {error ? <p className="text-sm text-destructive">{error}</p> : null}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                  </Button>
                </Stack>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-4">
              <form onSubmit={(e) => void onRegister(e)}>
                <Stack gap="md">
                  <FormField label="Name" htmlFor="register-name" required>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      required
                    />
                  </FormField>
                  <FormField label="Email" htmlFor="register-email" required>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </FormField>
                  <FormField label="Phone" htmlFor="register-phone">
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                    />
                  </FormField>
                  <FormField label="Password" htmlFor="register-password" required>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </FormField>
                  {error ? <p className="text-sm text-destructive">{error}</p> : null}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account…' : 'Create account'}
                  </Button>
                </Stack>
              </form>
            </TabsContent>

            <TabsContent value="reset" className="mt-4">
              <form onSubmit={(e) => void onResetPassword(e)}>
                <Stack gap="md">
                  <FormField label="Email" htmlFor="reset-email" required>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </FormField>
                  {resetSent ? (
                    <p className="text-sm text-muted-foreground">
                      If an account exists, a reset notification has been sent.
                    </p>
                  ) : null}
                  {error ? <p className="text-sm text-destructive">{error}</p> : null}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Requesting…' : 'Request reset'}
                  </Button>
                </Stack>
              </form>
            </TabsContent>
          </Tabs>
        </Stack>
      </CardContent>
    </Card>
  );
}
