import { NextResponse } from 'next/server';
import { AUTH_COOKIE_TENANT } from '@/lib/auth/constants';

export async function POST(request: Request) {
  const { tenantId } = (await request.json()) as { tenantId: string };
  const res = NextResponse.json({ success: true });
  const secure = process.env.NODE_ENV === 'production';

  res.cookies.set(AUTH_COOKIE_TENANT, tenantId, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
  });

  return res;
}
