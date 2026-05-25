import { NextResponse } from 'next/server';
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_REFRESH, AUTH_COOKIE_TENANT } from '@/lib/auth/constants';
import { getApiBaseUrl } from '@/lib/api/config';

function decodeState(state: string): { tenantId?: string; providerId?: string; nonce?: string } {
  const [, payload] = state.split('.');
  if (!payload) return {};
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { tenantId?: string; providerId?: string; nonce?: string };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code') ?? undefined;
  const idToken = url.searchParams.get('id_token') ?? undefined;
  const state = url.searchParams.get('state') ?? undefined;
  const error = url.searchParams.get('error');
  if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url));
  if (!state || (!code && !idToken)) return NextResponse.redirect(new URL('/login?error=sso_callback', request.url));

  const decoded = decodeState(state);
  if (!decoded.tenantId || !decoded.providerId) return NextResponse.redirect(new URL('/login?error=sso_state', request.url));

  const response = await fetch(`${getApiBaseUrl()}/sso/callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': decoded.tenantId,
    },
    body: JSON.stringify({
      providerId: decoded.providerId,
      code,
      idToken,
      state,
      nonce: decoded.nonce,
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.redirect(new URL('/login?error=sso_failed', request.url));

  const data = (payload as { data: { accessToken: string; refreshToken: string } }).data;
  const res = NextResponse.redirect(new URL('/dashboard', request.url));
  const secure = process.env.NODE_ENV === 'production';
  res.cookies.set(AUTH_COOKIE_ACCESS, data.accessToken, { httpOnly: true, sameSite: 'lax', secure, path: '/' });
  res.cookies.set(AUTH_COOKIE_REFRESH, data.refreshToken, { httpOnly: true, sameSite: 'lax', secure, path: '/' });
  res.cookies.set(AUTH_COOKIE_TENANT, decoded.tenantId, { httpOnly: true, sameSite: 'lax', secure, path: '/' });
  return res;
}
