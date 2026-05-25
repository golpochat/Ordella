'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@shared-ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export function PosLoginForm() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': tenantId },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError((payload as { message?: string } | null)?.message ?? 'Login failed');
        return;
      }
      const data = (payload as { data: { accessToken: string } }).data;
      localStorage.setItem('ordella.accessToken', data.accessToken);
      localStorage.setItem('ordella.tenantId', tenantId);
      router.push('/home');
    } catch {
      setError('Unable to reach the API');
    } finally {
      setLoading(false);
    }
  };

  const startSso = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/sso/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': tenantId },
        body: JSON.stringify({ redirectUrl: `${window.location.origin}/login` }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError((payload as { message?: string } | null)?.message ?? 'Unable to start SSO');
        return;
      }
      const authorizationUrl = (payload as { data: { authorizationUrl?: string } }).data.authorizationUrl;
      if (!authorizationUrl) {
        setError('SSO provider is not configured');
        return;
      }
      localStorage.setItem('ordella.tenantId', tenantId);
      window.location.assign(authorizationUrl);
    } catch {
      setError('Unable to reach the SSO provider');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={login}>
      <Input placeholder="Tenant UUID" value={tenantId} onChange={(event) => setTenantId(event.target.value)} required />
      <Input placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <Input placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={startSso} disabled={loading || !tenantId}>
        Login with SSO
      </Button>
    </form>
  );
}
