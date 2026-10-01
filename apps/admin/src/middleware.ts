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

  // 2. Detect if request is targeting the Admin subdomain (e.g. admin.zeedo.bid, admin.localhost:3000)
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

  // 3. For main domain (zeedo.bid or default localhost)
  // If user navigates directly to /admin, allow direct path access as a fallback
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // 3. Redirect any legacy /marketplace paths to the new landing page
  if (pathname.startsWith('/marketplace')) {
    url.pathname = '/';
    return NextResponse.redirect(url, { status: 301 });
  }

  // 4. Default: Continue to the landing page at /
  return NextResponse.next();
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
