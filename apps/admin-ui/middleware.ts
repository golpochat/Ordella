import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_TENANT } from '@/lib/auth/constants';
import { getApiBaseUrl } from '@/lib/api/config';

const PUBLIC_PATHS = ['/login', '/signup'];

async function fetchOnboardingComplete(
  token: string,
  tenantId: string,
): Promise<boolean | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/onboarding/progress`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': tenantId,
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { isComplete?: boolean } };
    return json.data?.isComplete === true;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthApi = pathname.startsWith('/api/auth');
  const isOnboarding = pathname === '/onboarding' || pathname.startsWith('/onboarding/');
  const token = request.cookies.get(AUTH_COOKIE_ACCESS)?.value;
  const tenantId = request.cookies.get(AUTH_COOKIE_TENANT)?.value;

  if (isPublic || isAuthApi) {
    if (token && tenantId && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!tenantId) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'tenant_required');
    return NextResponse.redirect(loginUrl);
  }

  const onboardingComplete = await fetchOnboardingComplete(token, tenantId);

  if (onboardingComplete === false && !isOnboarding) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  if (onboardingComplete === true && isOnboarding) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (token && pathname === '/login') {
    return NextResponse.redirect(
      new URL(onboardingComplete ? '/dashboard' : '/onboarding', request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
