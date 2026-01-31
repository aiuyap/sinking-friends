import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './lib/firebase';

export async function middleware(req: NextRequest) {
  // Exclude public routes from authentication
  const publicPaths = [
    '/',
    '/login',
    '/invite',
    '/privacy-policy',
    '/terms-of-service'
  ];

  const path = req.nextUrl.pathname;

  // Allow public routes without authentication
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // Check for Firebase authentication token
  const token = req.cookies.get('__session')?.value;

  if (!token) {
    // Redirect to login if no token and not a public route
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    // Verify token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Add user ID to request headers for API route access
    const headers = new Headers(req.headers);
    headers.set('x-user-id', decodedToken.uid);

    return NextResponse.next({
      request: {
        headers
      }
    });
  } catch (error) {
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/groups/:path*', 
    '/notifications/:path*',
    '/api/:path*'
  ]
};