import { NextRequest, NextResponse } from 'next/server';

export async function proxy(req: NextRequest) {
  // Exclude public routes from authentication
  const publicPaths = [
    '/',
    '/invite',
    '/privacy-policy',
    '/terms-of-service'
  ];

  const path = req.nextUrl.pathname;

  // Allow public routes without authentication
  if (publicPaths.some(publicPath => path === publicPath || path.startsWith(`${publicPath}/`))) {
    return NextResponse.next();
  }

  // Check for Firebase authentication token
  // Note: Full token verification happens in API routes using firebase-admin
  // Proxy only checks for presence of auth cookie for performance
  const token = req.cookies.get('__session')?.value;

  if (!token) {
    // For API routes, return 401
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    // For page routes, redirect to home page (which has login)
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Pass token along in headers for API route verification
  const headers = new Headers(req.headers);
  headers.set('x-auth-token', token);

  return NextResponse.next({
    request: {
      headers
    }
  });
}

// Specify which routes this proxy should run on
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/groups/:path*', 
    '/notifications/:path*',
    '/api/:path*'
  ]
};
