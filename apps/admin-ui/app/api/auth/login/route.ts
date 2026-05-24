import { NextResponse } from 'next/server';
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_REFRESH, AUTH_COOKIE_TENANT } from '@/lib/auth/constants';
import { getApiBaseUrl } from '@/lib/api/config';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email: string;
    password: string;
    tenantId: string;
  };

  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': body.tenantId,
    },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (payload as { message?: string } | null)?.message ?? 'Login failed';
    return NextResponse.json({ message }, { status: response.status });
  }

  const data = (payload as { data: { accessToken: string; refreshToken: string } }).data;
  const res = NextResponse.json({ success: true, accessToken: data.accessToken });
  const secure = process.env.NODE_ENV === 'production';

  res.cookies.set(AUTH_COOKIE_ACCESS, data.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
  });
  res.cookies.set(AUTH_COOKIE_REFRESH, data.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
  });
  res.cookies.set(AUTH_COOKIE_TENANT, body.tenantId, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
  });

  return res;
}
