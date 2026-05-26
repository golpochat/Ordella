'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
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
        <form className="space-y-3" onSubmit={(e) => void onSubmit(e)}>
          <div className="space-y-1">
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
          <div className="space-y-1">
            <label htmlFor="driverId" className="text-sm font-medium">
              Driver profile ID
            </label>
            <Input
              id="driverId"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="driverName" className="text-sm font-medium">
              Display name
            </label>
            <Input
              id="driverName"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
