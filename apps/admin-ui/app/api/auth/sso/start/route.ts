import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/api/config';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    tenantId: string;
    providerId?: string;
    redirectUrl?: string;
  };

  const response = await fetch(`${getApiBaseUrl()}/sso/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': body.tenantId,
    },
    body: JSON.stringify({ providerId: body.providerId, redirectUrl: body.redirectUrl }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (payload as { message?: string } | null)?.message ?? 'Unable to start SSO';
    return NextResponse.json({ message }, { status: response.status });
  }
  return NextResponse.json((payload as { data: unknown }).data);
}
