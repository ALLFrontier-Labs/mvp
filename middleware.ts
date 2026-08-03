import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
  '/overview',
  '/dashboard',
  '/playground',
  '/keys',
  '/vault',
  '/settings',
  '/logs',
  '/jobs',
  '/workspaces',
  '/billing',
];

const AUTH_ONLY_ROUTES = ['/login', '/signup', '/auth'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Static assets, public routes, docs, terms, privacy, gateway endpoints skip middleware
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/v1/gateway') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/terms' ||
    pathname === '/privacy' ||
    pathname.startsWith('/docs')
  ) {
    return NextResponse.next();
  }

  // Check session cookie / token
  const token =
    request.cookies.get('litedaemon_session')?.value ||
    request.cookies.get('litedaemon_api_key')?.value ||
    request.headers.get('authorization');

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthOnly = AUTH_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !token) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthOnly && token) {
    return NextResponse.redirect(new URL('/overview', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
