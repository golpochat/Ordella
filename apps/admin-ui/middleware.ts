import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_REFRESH, AUTH_COOKIE_TENANT } from '@/lib/auth/constants';
import { getApiBaseUrl } from '@/lib/api/config';

const PUBLIC_PATHS = ['/login', '/signup'];
type OnboardingStatus = boolean | 'unauthorized' | null;

function isExpiredJwt(token: string): boolean {
  try {
    const [, payload] = token.split('.');
    if (!payload) return true;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const decoded = JSON.parse(atob(padded)) as { exp?: number };
    return Boolean(decoded.exp && decoded.exp * 1000 <= Date.now());
  } catch {
    return true;
  }
}

function redirectToLogin(request: NextRequest, reason?: string) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  if (reason) {
    loginUrl.searchParams.set('error', reason);
  }

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(AUTH_COOKIE_ACCESS);
  response.cookies.delete(AUTH_COOKIE_REFRESH);
  response.cookies.delete(AUTH_COOKIE_TENANT);
  return response;
}

async function fetchOnboardingComplete(
  token: string,
  tenantId: string,
): Promise<OnboardingStatus> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/onboarding/progress`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': tenantId,
      },
      cache: 'no-store',
    });
    if (res.status === 401) return 'unauthorized';
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
    if (token && isExpiredJwt(token)) {
      const response = NextResponse.next();
      response.cookies.delete(AUTH_COOKIE_ACCESS);
      response.cookies.delete(AUTH_COOKIE_REFRESH);
      response.cookies.delete(AUTH_COOKIE_TENANT);
      return response;
    }
    if (token && tenantId && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return redirectToLogin(request);
  }

  if (!tenantId) {
    return redirectToLogin(request, 'tenant_required');
  }

  if (isExpiredJwt(token)) {
    return redirectToLogin(request, 'session_expired');
  }

  const onboardingComplete = await fetchOnboardingComplete(token, tenantId);

  if (onboardingComplete === 'unauthorized') {
    return redirectToLogin(request, 'session_expired');
  }

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
