import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_TENANT } from '@/lib/auth/constants';

const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthApi = pathname.startsWith('/api/auth');
  const token = request.cookies.get(AUTH_COOKIE_ACCESS)?.value;

  if (isPublic || isAuthApi) {
    if (token && pathname === '/login') {
      return NextResponse.redirect(new URL('/products', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!request.cookies.get(AUTH_COOKIE_TENANT)?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'tenant_required');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
