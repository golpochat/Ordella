'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@shared-ui';
import { browserTokenStorage } from '@/lib/api/browser';
import { parseJwtPayload } from '@shared-utils';

export function UserMenu() {
  const router = useRouter();
  const token = browserTokenStorage.getAccessToken();
  const payload = token ? parseJwtPayload<{ email?: string; sub?: string }>(token) : null;
  const label = payload?.email ?? payload?.sub ?? 'Admin';

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    browserTokenStorage.clear();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-muted-foreground sm:inline">{label}</span>
      <Button variant="outline" size="sm" onClick={logout}>
        Sign out
      </Button>
    </div>
  );
}
