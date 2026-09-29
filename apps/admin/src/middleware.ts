import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const { pathname } = url;

  // 1. Skip API routes, Next.js internal static assets, public static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Detect if request is targeting the Admin subdomain (e.g. admin.zeedo.auction, admin.localhost:3000)
  const isAdminSubdomain = hostname.toLowerCase().startsWith('admin.');

  if (isAdminSubdomain) {
    // If already targeting /admin, continue normally
    if (pathname.startsWith('/admin')) {
      return NextResponse.next();
    }
    // Rewrite path to /admin/[route]
    url.pathname = `/admin${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  // 3. For main domain (zeedo.auction or default localhost)
  // If user navigates directly to /admin, allow direct path access as a fallback
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // If already prefixed with /marketplace, allow
  if (pathname.startsWith('/marketplace')) {
    return NextResponse.next();
  }

  // Rewrite to buyer marketplace experience
  url.pathname = `/marketplace${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - API routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
