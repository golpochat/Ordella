import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parseHostRouting } from '@ordella/shared-utils';

const PLATFORM_BASE = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? 'ordella.local';
const ONBOARDING_HOSTS = (process.env.NEXT_PUBLIC_ONBOARDING_HOSTS ?? 'app.ordella.local')
  .split(',')
  .map((h) => h.trim());

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0] ?? '';
  const hint = parseHostRouting(host, {
    platformBaseDomain: PLATFORM_BASE,
    onboardingHosts: ONBOARDING_HOSTS,
  });

  if (hint.isOnboardingHost) {
    return NextResponse.next();
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const resolveUrl = new URL('/api/v1/public/domain/resolve', apiUrl);
  resolveUrl.searchParams.set('domain', host);

  try {
    const res = await fetch(resolveUrl.toString(), { next: { revalidate: 300 } });
    if (!res.ok) {
      return NextResponse.next();
    }
    const body = (await res.json()) as { data?: { tenantId?: string } };
    const tenantId = body.data?.tenantId;
    if (!tenantId) {
      return NextResponse.next();
    }

    const response = NextResponse.next();
    response.headers.set('x-tenant-id', tenantId);
    response.cookies.set('ordella_tenant_id', tenantId, {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
