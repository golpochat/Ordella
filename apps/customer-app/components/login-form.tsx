'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared-ui';
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
  const [tenantId, setTenantId] = useState(getTenantId());
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        <div className="mb-4 space-y-1">
          <label htmlFor="tenantId" className="text-sm font-medium">
            Tenant ID
          </label>
          <Input
            id="tenantId"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            required
          />
        </div>

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
            <form className="space-y-3" onSubmit={(e) => void onPasswordLogin(e)}>
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <form className="space-y-3" onSubmit={(e) => void onRegister(e)}>
              <div className="space-y-1">
                <label htmlFor="register-name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="register-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="register-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="register-phone" className="text-sm font-medium">
                  Phone
                </label>
                <Input
                  id="register-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="register-password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="reset" className="mt-4">
            <form className="space-y-3" onSubmit={(e) => void onResetPassword(e)}>
              <div className="space-y-1">
                <label htmlFor="reset-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {resetSent ? (
                <p className="text-sm text-muted-foreground">
                  If an account exists, a reset notification has been sent.
                </p>
              ) : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Requesting…' : 'Request reset'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
