'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@shared-ui';
import { FormErrorAlert } from '@/components/ui/admin-form-validation';
import { FormField, FormLayout } from '@/components/ui/admin-form';
import { browserTokenStorage } from '@/lib/api/browser';

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const requestedTenantId = tenantId.trim();
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': requestedTenantId,
        },
        body: JSON.stringify({ email, password, tenantId: requestedTenantId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((body as { message?: string }).message ?? 'Login failed');
        return;
      }

      const accessToken = (body as { accessToken?: string }).accessToken;
      if (accessToken) browserTokenStorage.setAccessToken(accessToken);
      browserTokenStorage.setTenantId(requestedTenantId);
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }

  async function onSsoLogin() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/sso/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, redirectUrl: `${window.location.origin}/api/auth/sso/callback` }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((body as { message?: string }).message ?? 'Unable to start SSO');
        return;
      }
      const authorizationUrl = (body as { authorizationUrl?: string }).authorizationUrl;
      if (!authorizationUrl) {
        setError('SSO provider is not configured');
        return;
      }
      browserTokenStorage.setTenantId(tenantId);
      window.location.assign(authorizationUrl);
    } catch {
      setError('Unable to reach the SSO provider');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FormLayout constrained={false}>
        <FormErrorAlert message={error} title="Sign in failed" />
        <FormField label="Tenant ID" htmlFor="tenantId" required>
          <Input
            id="tenantId"
            required
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="Tenant UUID"
          />
        </FormField>
        <FormField label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <FormField label="Password" htmlFor="password" required>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        <Button type="submit" className="w-full" isLoading={loading} loadingLabel="Signing in…">
          Sign in
        </Button>
        <Button type="button" variant="outline" className="w-full" disabled={loading || !tenantId} onClick={onSsoLogin}>
          Login with SSO
        </Button>
      </FormLayout>
    </form>
  );
}
