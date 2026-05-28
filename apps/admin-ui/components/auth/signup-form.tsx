'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@shared-ui';
import { FormErrorAlert } from '@/components/ui/admin-form-validation';
import { FormField, FormLayout } from '@/components/ui/admin-form';
import { browserTokenStorage } from '@/lib/api/browser';

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((body as { message?: string }).message ?? 'Signup failed');
        return;
      }

      const accessToken = (body as { accessToken?: string }).accessToken;
      const tenantId = (body as { tenantId?: string }).tenantId;
      if (accessToken) browserTokenStorage.setAccessToken(accessToken);
      if (tenantId) browserTokenStorage.setTenantId(tenantId);
      router.push('/onboarding');
      router.refresh();
    } catch {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FormLayout constrained={false}>
        <FormErrorAlert message={error} title="Unable to create account" />
        <FormField label="Business name" htmlFor="name" required>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your business"
          />
        </FormField>
        <FormField label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <FormField label="Password" htmlFor="password" required>
          <Input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        <Button type="submit" className="w-full" isLoading={loading} loadingLabel="Creating account…">
          Create account
        </Button>
      </FormLayout>
    </form>
  );
}
