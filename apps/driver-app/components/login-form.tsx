'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, FormErrorMessage, FormField, Input, Stack } from '@shared-ui';
import { createBrowserTokenStorage } from '@shared-utils';
import { getApiBaseUrl, getDefaultDriverId, getTenantId } from '@/lib/config';
import { setSession, type DriverSession } from '@/lib/session';

const storage = createBrowserTokenStorage();

export function LoginForm() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState(getTenantId());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [driverId, setDriverId] = useState(getDefaultDriverId());
  const [driverName, setDriverName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const requestedTenantId = tenantId.trim();
      const requestedDriverId = driverId.trim();
      const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': requestedTenantId,
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          (payload as { message?: string } | null)?.message ?? 'Login failed';
        throw new Error(message);
      }

      const data = (payload as { data: { accessToken: string; refreshToken?: string } }).data;
      storage.setAccessToken(data.accessToken);
      storage.setTenantId(requestedTenantId);

      const session: DriverSession = {
        tenantId: requestedTenantId,
        driverId: requestedDriverId,
        driverName: driverName || 'Driver',
        accessToken: data.accessToken,
        status: 'available',
      };
      setSession(session);
      router.replace('/orders');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Driver sign in</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void onSubmit(e)}>
          <Stack gap="md">
            <FormField label="Tenant ID" htmlFor="tenantId" required>
              <Input
                id="tenantId"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Email" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Password" htmlFor="password" required>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Driver profile ID" htmlFor="driverId" required>
              <Input
                id="driverId"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Display name" htmlFor="driverName">
              <Input
                id="driverName"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
              />
            </FormField>
            <div aria-live="polite">
              <FormErrorMessage>{error}</FormErrorMessage>
            </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
