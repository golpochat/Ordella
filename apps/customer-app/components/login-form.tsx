'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared-ui';
import { loginWithOtp, loginWithPassword, requestOtp } from '@/lib/api';
import { getTenantId } from '@/lib/config';
import {
  setCustomerId,
  setCustomerName,
  tokenStorage,
} from '@/lib/session';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [tenantId, setTenantId] = useState(getTenantId());
  const [otpSent, setOtpSent] = useState(false);
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

  const onRequestOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      tokenStorage.setTenantId(tenantId);
      await requestOtp(email);
      setOtpSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const onOtpLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      tokenStorage.setTenantId(tenantId);
      const result = await loginWithOtp(email, otp);
      completeLogin(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OTP login failed');
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
            <TabsTrigger value="otp" className="flex-1">
              Email OTP
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

          <TabsContent value="otp" className="mt-4">
            <form className="space-y-3" onSubmit={(e) => void onOtpLogin(e)}>
              <div className="space-y-1">
                <label htmlFor="otp-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="otp-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {!otpSent ? (
                <Button type="button" className="w-full" disabled={loading} onClick={() => void onRequestOtp()}>
                  Send OTP
                </Button>
              ) : (
                <div className="space-y-1">
                  <label htmlFor="otp-code" className="text-sm font-medium">
                    One-time code
                  </label>
                  <Input
                    id="otp-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              )}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {otpSent ? (
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Verifying…' : 'Verify & sign in'}
                </Button>
              ) : null}
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
